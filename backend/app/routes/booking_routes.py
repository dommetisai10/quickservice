from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from app.database import get_database
from app.schemas.booking_schema import (
    BookingCreateRequest, 
    StatusUpdateRequest, 
    BookingResponse, 
    AvailableSlotsResponse,
    PREDEFINED_TIME_SLOTS
)
from app.services.booking_logic import generate_unique_booking_id, validate_status_transition
from app.dependencies.auth_deps import get_current_user, get_customer_user, get_provider_user

router = APIRouter(prefix="/api/bookings", tags=["Booking System"])

@router.get("/available-slots", response_model=AvailableSlotsResponse)
async def get_available_slots(
    providerId: str = Query(...),
    bookingDate: str = Query(...),
    db=Depends(get_database)
):
    try:
        provider_oid = ObjectId(providerId)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid provider ID format.")

    # Find active bookings for this provider on specified date
    cursor = db.bookings.find({
        "providerId": provider_oid,
        "bookingDate": bookingDate,
        "status": {"$in": ["PENDING", "ACCEPTED", "STARTED"]}
    })
    
    active_bookings = await cursor.to_list(length=100)
    booked_slots = [b["timeSlot"] for b in active_bookings]

    available_slots = [slot for slot in PREDEFINED_TIME_SLOTS if slot not in booked_slots]

    return AvailableSlotsResponse(
        providerId=providerId,
        bookingDate=bookingDate,
        availableSlots=available_slots,
        bookedSlots=booked_slots
    )

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_booking(
    req: BookingCreateRequest,
    current_customer=Depends(get_customer_user),
    db=Depends(get_database)
):
    try:
        provider_oid = ObjectId(req.providerId)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid provider ID format.")

    # 1. Fetch Provider Profile
    provider = await db.providers.find_one({"_id": provider_oid})
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target service provider not found.")

    # 2. Provider Verification & Availability Check
    if provider.get("verificationStatus") != "VERIFIED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This provider is not currently verified by Admin to accept bookings."
        )

    if not provider.get("isAvailable", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This provider is currently set to unavailable."
        )

    # 3. Check Slot Double Booking in Application Logic Layer
    existing_conflict = await db.bookings.find_one({
        "providerId": provider_oid,
        "bookingDate": req.bookingDate,
        "timeSlot": req.timeSlot,
        "status": {"$in": ["PENDING", "ACCEPTED", "STARTED"]}
    })

    if existing_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is no longer available."
        )

    # 4. Generate Unique Sequential Booking ID (QS-2026-000001)
    booking_id = await generate_unique_booking_id(db)
    now = datetime.now(timezone.utc)
    estimated_price = provider.get("hourlyRate", 399.0)

    booking_doc = {
        "bookingId": booking_id,
        "customerId": ObjectId(current_customer["_id"]),
        "providerId": provider_oid,
        "serviceId": ObjectId(req.serviceId) if req.serviceId and ObjectId.is_valid(req.serviceId) else None,
        "serviceName": req.serviceName,
        "bookingDate": req.bookingDate,
        "timeSlot": req.timeSlot,
        "address": req.address,
        "city": req.city,
        "state": req.state,
        "pincode": req.pincode,
        "description": req.description,
        "estimatedPrice": estimated_price,
        "finalPrice": estimated_price,
        "status": "PENDING",
        "customerNotes": req.customerNotes,
        "providerNotes": "",
        "createdAt": now,
        "updatedAt": now
    }

    # 5. Insert Document with Catch for MongoDB Unique Partial Index Collision
    try:
        result = await db.bookings.insert_one(booking_doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is no longer available."
        )

    # 6. Create Notifications
    # Customer Notification
    await db.notifications.insert_one({
        "userId": ObjectId(current_customer["_id"]),
        "title": "Booking Request Created",
        "message": f"Your booking request {booking_id} for {req.serviceName} on {req.bookingDate} ({req.timeSlot}) has been sent.",
        "type": "BOOKING_CREATED",
        "isRead": False,
        "createdAt": now
    })

    # Provider Notification
    await db.notifications.insert_one({
        "userId": provider["userId"],
        "title": "New Service Request Received",
        "message": f"You received a new booking request {booking_id} from {current_customer['fullName']} for {req.bookingDate}.",
        "type": "NEW_BOOKING_REQUEST",
        "isRead": False,
        "createdAt": now
    })

    booking_doc["id"] = str(result.inserted_id)
    booking_doc["_id"] = str(result.inserted_id)
    booking_doc["customerId"] = str(current_customer["_id"])
    booking_doc["providerId"] = str(provider_oid)
    if booking_doc["serviceId"]:
        booking_doc["serviceId"] = str(booking_doc["serviceId"])
    booking_doc["createdAt"] = now.isoformat()
    booking_doc["updatedAt"] = now.isoformat()

    return booking_doc

@router.get("")
async def get_user_bookings(
    status: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    query = {}
    user_role = current_user["role"]

    if user_role == "CUSTOMER":
        query["customerId"] = ObjectId(current_user["_id"])
    elif user_role == "PROVIDER":
        provider_doc = await db.providers.find_one({"userId": ObjectId(current_user["_id"])})
        if not provider_doc:
            return []
        query["providerId"] = provider_doc["_id"]

    if status and status != "ALL":
        query["status"] = status

    cursor = db.bookings.find(query).sort("createdAt", -1)
    bookings = await cursor.to_list(length=200)

    result = []
    for b in bookings:
        cust = await db.users.find_one({"_id": b["customerId"]})
        prov = await db.providers.find_one({"_id": b["providerId"]})
        
        result.append({
            "id": str(b["_id"]),
            "bookingId": b["bookingId"],
            "customerId": str(b["customerId"]),
            "customerName": cust["fullName"] if cust else "Customer",
            "customerPhone": cust["phone"] if cust else "",
            "providerId": str(b["providerId"]),
            "providerBusinessName": prov["businessName"] if prov else "Provider",
            "providerPhone": prov["phone"] if prov else "",
            "serviceName": b["serviceName"],
            "bookingDate": b["bookingDate"],
            "timeSlot": b["timeSlot"],
            "address": b["address"],
            "city": b["city"],
            "state": b["state"],
            "pincode": b["pincode"],
            "description": b["description"],
            "estimatedPrice": b.get("estimatedPrice", 0.0),
            "finalPrice": b.get("finalPrice", 0.0),
            "status": b["status"],
            "customerNotes": b.get("customerNotes"),
            "providerNotes": b.get("providerNotes"),
            "createdAt": b["createdAt"].strftime("%Y-%m-%d %H:%M") if isinstance(b.get("createdAt"), datetime) else str(b.get("createdAt")),
            "updatedAt": b["updatedAt"].strftime("%Y-%m-%d %H:%M") if isinstance(b.get("updatedAt"), datetime) else str(b.get("updatedAt"))
        })
    return result

@router.get("/{booking_id}")
async def get_booking_details(
    booking_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    try:
        oid = ObjectId(booking_id)
        query = {"_id": oid}
    except Exception:
        query = {"bookingId": booking_id}

    booking = await db.bookings.find_one(query)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking record not found.")

    cust = await db.users.find_one({"_id": booking["customerId"]})
    prov = await db.providers.find_one({"_id": booking["providerId"]})

    return {
        "id": str(booking["_id"]),
        "bookingId": booking["bookingId"],
        "customerId": str(booking["customerId"]),
        "customerName": cust["fullName"] if cust else "Customer",
        "customerPhone": cust["phone"] if cust else "",
        "customerEmail": cust["email"] if cust else "",
        "providerId": str(booking["providerId"]),
        "providerBusinessName": prov["businessName"] if prov else "Provider",
        "providerPhone": prov["phone"] if prov else "",
        "providerEmail": prov["email"] if prov else "",
        "serviceName": booking["serviceName"],
        "bookingDate": booking["bookingDate"],
        "timeSlot": booking["timeSlot"],
        "address": booking["address"],
        "city": booking["city"],
        "state": booking["state"],
        "pincode": booking["pincode"],
        "description": booking["description"],
        "estimatedPrice": booking.get("estimatedPrice", 0.0),
        "finalPrice": booking.get("finalPrice", 0.0),
        "status": booking["status"],
        "customerNotes": booking.get("customerNotes"),
        "providerNotes": booking.get("providerNotes"),
        "createdAt": booking["createdAt"].strftime("%Y-%m-%d %H:%M") if isinstance(booking.get("createdAt"), datetime) else str(booking.get("createdAt")),
        "updatedAt": booking["updatedAt"].strftime("%Y-%m-%d %H:%M") if isinstance(booking.get("updatedAt"), datetime) else str(booking.get("updatedAt"))
    }

# Action Status Transition Endpoints
@router.put("/{booking_id}/accept")
async def accept_booking(booking_id: str, current_user=Depends(get_provider_user), db=Depends(get_database)):
    return await update_status(booking_id, "ACCEPTED", current_user, db)

@router.put("/{booking_id}/reject")
async def reject_booking(booking_id: str, current_user=Depends(get_provider_user), db=Depends(get_database)):
    return await update_status(booking_id, "REJECTED", current_user, db)

@router.put("/{booking_id}/start")
async def start_booking(booking_id: str, current_user=Depends(get_provider_user), db=Depends(get_database)):
    return await update_status(booking_id, "STARTED", current_user, db)

@router.put("/{booking_id}/complete")
async def complete_booking(booking_id: str, current_user=Depends(get_provider_user), db=Depends(get_database)):
    # Increment provider completed jobs counter upon completion
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if booking:
        await db.providers.update_one({"_id": booking["providerId"]}, {"$inc": {"completedJobs": 1}})
    return await update_status(booking_id, "COMPLETED", current_user, db)

@router.put("/{booking_id}/cancel")
async def cancel_booking(booking_id: str, current_user=Depends(get_customer_user), db=Depends(get_database)):
    return await update_status(booking_id, "CANCELLED", current_user, db)

async def update_status(booking_id: str, target_status: str, current_user: dict, db):
    try:
        oid = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid booking ID format.")

    booking = await db.bookings.find_one({"_id": oid})
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking record not found.")

    # Validate state transition & role permissions
    validate_status_transition(booking["status"], target_status, current_user["role"])

    now = datetime.now(timezone.utc)
    await db.bookings.update_one({"_id": oid}, {"$set": {"status": target_status, "updatedAt": now}})

    # Create notification for Customer
    status_messages = {
        "ACCEPTED": "Your booking request has been accepted by the provider.",
        "REJECTED": "Your booking request was rejected by the provider.",
        "STARTED": "Your service technician has started work on your job.",
        "COMPLETED": "Your service has been completed successfully. Please leave a rating!",
        "CANCELLED": "Booking has been cancelled."
    }

    await db.notifications.insert_one({
        "userId": booking["customerId"],
        "title": f"Booking {booking['bookingId']} Status: {target_status}",
        "message": status_messages.get(target_status, f"Status updated to {target_status}"),
        "type": f"BOOKING_{target_status}",
        "isRead": False,
        "createdAt": now
    })

    return {"message": f"Booking {booking['bookingId']} updated to status '{target_status}' successfully."}
