from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from app.database import get_database
from app.schemas.complaint_schema import ComplaintCreateRequest, ComplaintUpdateRequest, ComplaintResponse
from app.dependencies.auth_deps import get_current_user, get_customer_user, get_admin_user

router = APIRouter(prefix="/api/complaints", tags=["Customer Complaints"])

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    req: ComplaintCreateRequest,
    current_customer=Depends(get_customer_user),
    db=Depends(get_database)
):
    try:
        booking_oid = ObjectId(req.bookingId)
        booking = await db.bookings.find_one({"_id": booking_oid})
    except Exception:
        booking = await db.bookings.find_one({"bookingId": req.bookingId})

    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target booking record not found.")

    if str(booking["customerId"]) != current_customer["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only raise complaints for your own bookings."
        )

    now = datetime.now(timezone.utc)
    complaint_doc = {
        "bookingId": booking["_id"],
        "bookingRef": booking["bookingId"],
        "customerId": ObjectId(current_customer["_id"]),
        "providerId": booking["providerId"],
        "subject": req.subject,
        "description": req.description,
        "status": "OPEN",
        "adminResponse": "",
        "createdAt": now,
        "updatedAt": now
    }

    result = await db.complaints.insert_one(complaint_doc)
    prov = await db.providers.find_one({"_id": booking["providerId"]})

    return ComplaintResponse(
        id=str(result.inserted_id),
        bookingId=booking["bookingId"],
        customerId=current_customer["_id"],
        customerName=current_customer["fullName"],
        providerId=str(booking["providerId"]),
        providerBusinessName=prov["businessName"] if prov else "Provider",
        subject=req.subject,
        description=req.description,
        status="OPEN",
        adminResponse="",
        createdAt=now.strftime("%Y-%m-%d %H:%M"),
        updatedAt=now.strftime("%Y-%m-%d %H:%M")
    )

@router.get("")
async def get_complaints(
    status: str = Query("ALL"),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    query = {}
    if current_user["role"] == "CUSTOMER":
        query["customerId"] = ObjectId(current_user["_id"])

    if status != "ALL":
        query["status"] = status

    cursor = db.complaints.find(query).sort("createdAt", -1)
    complaints = await cursor.to_list(length=100)

    result = []
    for c in complaints:
        cust = await db.users.find_one({"_id": c["customerId"]})
        prov = await db.providers.find_one({"_id": c["providerId"]})
        
        result.append({
            "id": str(c["_id"]),
            "bookingId": c.get("bookingRef", str(c["bookingId"])),
            "customerId": str(c["customerId"]),
            "customerName": cust["fullName"] if cust else "Customer",
            "providerId": str(c["providerId"]),
            "providerBusinessName": prov["businessName"] if prov else "Provider",
            "subject": c["subject"],
            "description": c["description"],
            "status": c["status"],
            "adminResponse": c.get("adminResponse", ""),
            "createdAt": c["createdAt"].strftime("%Y-%m-%d %H:%M") if isinstance(c.get("createdAt"), datetime) else str(c.get("createdAt")),
            "updatedAt": c["updatedAt"].strftime("%Y-%m-%d %H:%M") if isinstance(c.get("updatedAt"), datetime) else str(c.get("updatedAt"))
        })
    return result

@router.put("/{complaint_id}")
async def resolve_complaint(
    complaint_id: str,
    req: ComplaintUpdateRequest,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    try:
        oid = ObjectId(complaint_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid complaint ID format.")

    complaint = await db.complaints.find_one({"_id": oid})
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint record not found.")

    now = datetime.now(timezone.utc)
    await db.complaints.update_one(
        {"_id": oid},
        {"$set": {"status": req.status, "adminResponse": req.adminResponse, "updatedAt": now}}
    )

    # Notify Customer
    await db.notifications.insert_one({
        "userId": complaint["customerId"],
        "title": f"Complaint Status: {req.status}",
        "message": f"Your complaint for booking {complaint.get('bookingRef')} has been updated to {req.status}. Admin note: {req.adminResponse}",
        "type": "COMPLAINT_RESOLVED",
        "isRead": False,
        "createdAt": now
    })

    return {"message": f"Complaint status updated to '{req.status}' successfully."}
