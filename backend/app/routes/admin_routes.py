import os
import math
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId
from app.database import get_database
from app.dependencies.auth_deps import get_admin_user
from app.utils.auth_utils import hash_password

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

# --- Helper Functions ---

def parse_oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format."
        )

async def log_admin_action(db, admin_user: dict, action: str, target_type: str, target_id: str, summary: str):
    await db.adminLogs.insert_one({
        "adminId": str(admin_user.get("_id", "")),
        "adminEmail": admin_user.get("email", "admin"),
        "action": action,
        "targetType": target_type,
        "targetId": target_id,
        "shortSummary": summary,
        "createdAt": datetime.now(timezone.utc)
    })

# --- Pydantic Request Models ---

class UpdateCustomerModel(BaseModel):
    fullName: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=10)
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    pincode: Optional[str] = ""
    profileImage: Optional[str] = ""
    isActive: bool = True

class ResetPasswordModel(BaseModel):
    newPassword: str = Field(..., min_length=8)

class UpdateProviderModel(BaseModel):
    fullName: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=10)
    businessName: str = Field(..., min_length=2)
    description: Optional[str] = ""
    serviceCategories: List[str] = []
    experience: Optional[int] = 0
    hourlyRate: Optional[float] = 0.0
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    pincode: Optional[str] = ""
    serviceRadius: Optional[int] = 10
    isAvailable: bool = True
    profileImage: Optional[str] = ""

class ProviderVerificationModel(BaseModel):
    status: str = Field(..., description="VERIFIED, REJECTED, or SUSPENDED")

# --- Dashboard & Logs Endpoints ---

@router.get("/dashboard")
async def get_admin_dashboard_stats(
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    total_customers = await db.users.count_documents({"role": "CUSTOMER"})
    active_customers = await db.users.count_documents({"role": "CUSTOMER", "isActive": True})
    inactive_customers = await db.users.count_documents({"role": "CUSTOMER", "isActive": False})

    total_providers = await db.providers.count_documents({})
    pending_providers = await db.providers.count_documents({"verificationStatus": "PENDING"})
    verified_providers = await db.providers.count_documents({"verificationStatus": "VERIFIED"})
    rejected_providers = await db.providers.count_documents({"verificationStatus": "REJECTED"})
    suspended_providers = await db.providers.count_documents({"verificationStatus": "SUSPENDED"})

    total_services = await db.services.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    completed_bookings = await db.bookings.count_documents({"status": "COMPLETED"})
    cancelled_bookings = await db.bookings.count_documents({"status": "CANCELLED"})
    open_complaints = await db.complaints.count_documents({"status": {"$in": ["OPEN", "IN_PROGRESS"]}})

    # Fetch latest 20 admin logs
    logs_cursor = db.adminLogs.find({}).sort("createdAt", -1).limit(20)
    logs_raw = await logs_cursor.to_list(length=20)
    recent_logs = []
    for l in logs_raw:
        recent_logs.append({
            "id": str(l["_id"]),
            "adminEmail": l.get("adminEmail", "Admin"),
            "action": l.get("action", ""),
            "targetType": l.get("targetType", ""),
            "targetId": l.get("targetId", ""),
            "shortSummary": l.get("shortSummary", ""),
            "createdAt": l["createdAt"].isoformat() if isinstance(l.get("createdAt"), datetime) else str(l.get("createdAt", ""))
        })

    return {
        "totalCustomers": total_customers,
        "activeCustomers": active_customers,
        "inactiveCustomers": inactive_customers,

        "totalProviders": total_providers,
        "pendingProviders": pending_providers,
        "verifiedProviders": verified_providers,
        "rejectedProviders": rejected_providers,
        "suspendedProviders": suspended_providers,

        "totalServices": total_services,
        "totalBookings": total_bookings,
        "completedBookings": completed_bookings,
        "cancelledBookings": cancelled_bookings,
        "openComplaints": open_complaints,

        "recentLogs": recent_logs
    }

@router.get("/logs")
async def get_admin_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    skip = (page - 1) * limit
    total = await db.adminLogs.count_documents({})
    cursor = db.adminLogs.find({}).sort("createdAt", -1).skip(skip).limit(limit)
    logs_raw = await cursor.to_list(length=limit)
    
    logs = []
    for l in logs_raw:
        logs.append({
            "id": str(l["_id"]),
            "adminEmail": l.get("adminEmail", "Admin"),
            "action": l.get("action", ""),
            "targetType": l.get("targetType", ""),
            "targetId": l.get("targetId", ""),
            "shortSummary": l.get("shortSummary", ""),
            "createdAt": l["createdAt"].isoformat() if isinstance(l.get("createdAt"), datetime) else str(l.get("createdAt", ""))
        })

    return {
        "logs": logs,
        "total": total,
        "page": page,
        "totalPages": math.ceil(total / limit) if total > 0 else 1
    }

# --- Customer Management Endpoints ---

@router.get("/users")
async def get_customers_list(
    role: Optional[str] = Query("CUSTOMER"),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    city: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    query = {}
    if role and role != "ALL":
        query["role"] = role

    if status_filter and status_filter != "ALL":
        if status_filter.upper() == "ACTIVE":
            query["isActive"] = True
        elif status_filter.upper() in ["INACTIVE", "DEACTIVATED"]:
            query["isActive"] = False

    if city and city.strip():
        query["city"] = {"$regex": city.strip(), "$options": "i"}

    if search and search.strip():
        s = search.strip()
        query["$or"] = [
            {"fullName": {"$regex": s, "$options": "i"}},
            {"email": {"$regex": s, "$options": "i"}},
            {"phone": {"$regex": s, "$options": "i"}}
        ]

    total = await db.users.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.users.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    raw_users = await cursor.to_list(length=limit)

    users = []
    for u in raw_users:
        users.append({
            "id": str(u["_id"]),
            "fullName": u.get("fullName", ""),
            "email": u.get("email", ""),
            "phone": u.get("phone", ""),
            "role": u.get("role", "CUSTOMER"),
            "city": u.get("city", ""),
            "state": u.get("state", ""),
            "address": u.get("address", ""),
            "pincode": u.get("pincode", ""),
            "profileImage": u.get("profileImage", ""),
            "isActive": u.get("isActive", True),
            "createdAt": u["createdAt"].strftime("%Y-%m-%d %H:%M") if isinstance(u.get("createdAt"), datetime) else "2026-03-01"
        })

    return {
        "users": users,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": math.ceil(total / limit) if total > 0 else 1
    }

@router.get("/users/{user_id}")
async def get_customer_details(
    user_id: str,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    oid = parse_oid(user_id)
    user = await db.users.find_one({"_id": oid}, {"password_hash": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    bookings_count = await db.bookings.count_documents({"customerId": user_id})
    active_bookings_count = await db.bookings.count_documents({
        "customerId": user_id,
        "status": {"$in": ["PENDING", "ACCEPTED", "STARTED"]}
    })
    reviews_count = await db.reviews.count_documents({"customerId": user_id})
    complaints_count = await db.complaints.count_documents({"customerId": user_id})

    user_data = {
        "id": str(user["_id"]),
        "fullName": user.get("fullName", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "role": user.get("role", "CUSTOMER"),
        "city": user.get("city", ""),
        "state": user.get("state", ""),
        "address": user.get("address", ""),
        "pincode": user.get("pincode", ""),
        "profileImage": user.get("profileImage", ""),
        "isActive": user.get("isActive", True),
        "createdAt": user["createdAt"].strftime("%Y-%m-%d %H:%M") if isinstance(user.get("createdAt"), datetime) else "2026-03-01",
        "stats": {
            "totalBookings": bookings_count,
            "activeBookings": active_bookings_count,
            "reviewsSubmitted": reviews_count,
            "complaintsFiled": complaints_count
        }
    }
    return user_data

@router.put("/users/{user_id}")
async def update_customer(
    user_id: str,
    payload: UpdateCustomerModel,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    oid = parse_oid(user_id)
    existing_user = await db.users.find_one({"_id": oid})
    if not existing_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    # Check email uniqueness if email changed
    if payload.email.lower() != existing_user["email"].lower():
        email_check = await db.users.find_one({"email": payload.email.lower()})
        if email_check:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email address is already used by another account."
            )

    update_fields = {
        "fullName": payload.fullName.strip(),
        "email": payload.email.lower().strip(),
        "phone": payload.phone.strip(),
        "address": payload.address.strip(),
        "city": payload.city.strip(),
        "state": payload.state.strip(),
        "pincode": payload.pincode.strip(),
        "profileImage": payload.profileImage.strip(),
        "isActive": payload.isActive,
        "updatedAt": datetime.now(timezone.utc)
    }

    await db.users.update_one({"_id": oid}, {"$set": update_fields})
    await log_admin_action(
        db, current_admin, "EDIT_CUSTOMER", "USER", user_id,
        f"Updated details for customer '{payload.fullName}' ({payload.email})"
    )

    return {"message": "Customer profile updated successfully."}

@router.put("/users/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    isActive: bool = Query(...),
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    oid = parse_oid(user_id)
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.get("role") == "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin accounts cannot be deactivated.")

    await db.users.update_one({"_id": oid}, {"$set": {"isActive": isActive, "updatedAt": datetime.now(timezone.utc)}})
    
    action_name = "ACTIVATE_USER" if isActive else "DEACTIVATE_USER"
    await log_admin_action(
        db, current_admin, action_name, "USER", user_id,
        f"{'Activated' if isActive else 'Deactivated'} account for '{user.get('fullName')}' ({user.get('email')})"
    )

    return {"message": f"User status updated to isActive={isActive}"}

@router.put("/users/{user_id}/reset-password")
async def reset_customer_password(
    user_id: str,
    payload: ResetPasswordModel,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    oid = parse_oid(user_id)
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    new_hash = get_password_hash(payload.newPassword)
    await db.users.update_one(
        {"_id": oid},
        {"$set": {"password_hash": new_hash, "updatedAt": datetime.now(timezone.utc)}}
    )

    await log_admin_action(
        db, current_admin, "RESET_PASSWORD", "USER", user_id,
        f"Reset password for user '{user.get('fullName')}' ({user.get('email')})"
    )
    return {"message": "User password reset successfully."}

@router.delete("/users/{user_id}")
async def delete_customer(
    user_id: str,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    oid = parse_oid(user_id)
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.get("role") == "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin accounts cannot be deleted.")

    # Check for active bookings (PENDING, ACCEPTED, STARTED)
    active_booking = await db.bookings.find_one({
        "customerId": user_id,
        "status": {"$in": ["PENDING", "ACCEPTED", "STARTED"]}
    })

    if active_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This customer has active bookings. Cancel them first or deactivate the account instead."
        )

    # Clean user data: delete notifications, anonymize completed bookings/reviews/complaints
    await db.notifications.delete_many({"userId": user_id})
    await db.bookings.update_many({"customerId": user_id}, {"$set": {"customerName": "Deleted User"}})
    await db.reviews.update_many({"customerId": user_id}, {"$set": {"customerName": "Deleted User"}})
    await db.complaints.update_many({"customerId": user_id}, {"$set": {"customerName": "Deleted User"}})

    # Delete main user document
    await db.users.delete_one({"_id": oid})

    await log_admin_action(
        db, current_admin, "DELETE_CUSTOMER", "USER", user_id,
        f"Permanently deleted customer '{user.get('fullName')}' ({user.get('email')})"
    )

    return {"message": "Customer account permanently deleted and past records anonymized."}

# --- Provider Management Endpoints ---

@router.get("/providers")
async def get_providers_list(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    city: Optional[str] = Query(None),
    service: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    query = {}

    # Treat "", "ALL", "undefined", "null" as no filter
    if status_filter:
        sf = status_filter.strip().upper()
        if sf not in ["ALL", "UNDEFINED", "NULL", ""]:
            query["verificationStatus"] = sf

    if city:
        c = city.strip()
        if c and c.lower() not in ["all", "undefined", "null"]:
            query["city"] = {"$regex": c, "$options": "i"}

    if service:
        s_cat = service.strip()
        if s_cat and s_cat.lower() not in ["all", "undefined", "null"]:
            query["serviceCategories"] = s_cat

    if search:
        s_query = search.strip()
        if s_query and s_query.lower() not in ["undefined", "null"]:
            query["$or"] = [
                {"businessName": {"$regex": s_query, "$options": "i"}},
                {"city": {"$regex": s_query, "$options": "i"}}
            ]

    total = await db.providers.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.providers.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    raw_providers = await cursor.to_list(length=limit)

    providers = []
    for p in raw_providers:
        user_id = p.get("userId")
        user = None
        if user_id:
            try:
                if isinstance(user_id, ObjectId):
                    user = await db.users.find_one({"_id": user_id}, {"password_hash": 0})
                elif isinstance(user_id, str) and ObjectId.is_valid(user_id):
                    user = await db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
                    if not user:
                        user = await db.users.find_one({"_id": user_id}, {"password_hash": 0})
            except Exception:
                pass

        providers.append({
            "id": str(p["_id"]),
            "userId": str(user_id) if user_id else "",
            "businessName": p.get("businessName", ""),
            "description": p.get("description", ""),
            "serviceCategories": p.get("serviceCategories", []),
            "city": p.get("city", ""),
            "state": p.get("state", ""),
            "rating": p.get("rating", 0.0),
            "totalReviews": p.get("totalReviews", 0),
            "completedJobs": p.get("completedJobs", 0),
            "verificationStatus": p.get("verificationStatus", "PENDING"),
            "isAvailable": p.get("isAvailable", True),
            "hourlyRate": p.get("hourlyRate", 0),
            "experience": p.get("experience", 0),
            "createdAt": p["createdAt"].strftime("%Y-%m-%d %H:%M") if isinstance(p.get("createdAt"), datetime) else "2026-03-01",
            "providerName": user.get("fullName", "Provider User") if user else "Unlinked Provider",
            "email": user.get("email", "") if user else "",
            "phone": user.get("phone", "") if user else ""
        })

    pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "items": providers,
        "providers": providers,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
        "totalPages": pages
    }

@router.get("/providers/{provider_id}")
async def get_provider_details(
    provider_id: str,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    oid = parse_oid(provider_id)
    provider = await db.providers.find_one({"_id": oid})
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found.")

    user = None
    user_id = provider.get("userId")
    if user_id:
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
        except Exception:
            pass

    bookings_count = await db.bookings.count_documents({"providerId": provider_id})
    active_bookings_count = await db.bookings.count_documents({
        "providerId": provider_id,
        "status": {"$in": ["PENDING", "ACCEPTED", "STARTED"]}
    })
    reviews_count = await db.reviews.count_documents({"providerId": provider_id})

    return {
        "id": str(provider["_id"]),
        "userId": user_id,
        "businessName": provider.get("businessName", ""),
        "description": provider.get("description", ""),
        "serviceCategories": provider.get("serviceCategories", []),
        "experience": provider.get("experience", 0),
        "hourlyRate": provider.get("hourlyRate", 0),
        "address": provider.get("address", ""),
        "city": provider.get("city", ""),
        "state": provider.get("state", ""),
        "pincode": provider.get("pincode", ""),
        "serviceRadius": provider.get("serviceRadius", 10),
        "isAvailable": provider.get("isAvailable", True),
        "verificationStatus": provider.get("verificationStatus", "PENDING"),
        "rating": provider.get("rating", 0.0),
        "totalReviews": provider.get("totalReviews", 0),
        "completedJobs": provider.get("completedJobs", 0),
        "createdAt": provider["createdAt"].strftime("%Y-%m-%d %H:%M") if isinstance(provider.get("createdAt"), datetime) else "2026-03-01",
        "user": {
            "fullName": user.get("fullName", "") if user else "",
            "email": user.get("email", "") if user else "",
            "phone": user.get("phone", "") if user else "",
            "isActive": user.get("isActive", True) if user else True
        },
        "stats": {
            "totalBookings": bookings_count,
            "activeBookings": active_bookings_count,
            "reviewsReceived": reviews_count
        }
    }

@router.put("/providers/{provider_id}")
async def update_provider(
    provider_id: str,
    payload: UpdateProviderModel,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    p_oid = parse_oid(provider_id)
    provider = await db.providers.find_one({"_id": p_oid})
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found.")

    user_id = provider.get("userId")
    if user_id:
        u_oid = parse_oid(user_id)
        existing_user = await db.users.find_one({"_id": u_oid})
        if existing_user and payload.email.lower() != existing_user["email"].lower():
            email_check = await db.users.find_one({"email": payload.email.lower()})
            if email_check:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email address is already used by another account."
                )

        # Update linked User document
        await db.users.update_one(
            {"_id": u_oid},
            {"$set": {
                "fullName": payload.fullName.strip(),
                "email": payload.email.lower().strip(),
                "phone": payload.phone.strip(),
                "city": payload.city.strip(),
                "state": payload.state.strip(),
                "address": payload.address.strip(),
                "pincode": payload.pincode.strip(),
                "profileImage": payload.profileImage.strip(),
                "updatedAt": datetime.now(timezone.utc)
            }}
        )

    # Update Provider document
    provider_update = {
        "businessName": payload.businessName.strip(),
        "description": payload.description.strip(),
        "serviceCategories": payload.serviceCategories,
        "experience": payload.experience,
        "hourlyRate": payload.hourlyRate,
        "address": payload.address.strip(),
        "city": payload.city.strip(),
        "state": payload.state.strip(),
        "pincode": payload.pincode.strip(),
        "serviceRadius": payload.serviceRadius,
        "isAvailable": payload.isAvailable,
        "updatedAt": datetime.now(timezone.utc)
    }
    await db.providers.update_one({"_id": p_oid}, {"$set": provider_update})

    await log_admin_action(
        db, current_admin, "EDIT_PROVIDER", "PROVIDER", provider_id,
        f"Updated provider business '{payload.businessName}' ({payload.email})"
    )

    return {"message": "Provider profile updated successfully."}

@router.put("/providers/{provider_id}/verify")
async def verify_provider_status(
    provider_id: str,
    payload: ProviderVerificationModel,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    p_oid = parse_oid(provider_id)
    provider = await db.providers.find_one({"_id": p_oid})
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found.")

    new_status = payload.status.upper()
    if new_status not in ["VERIFIED", "REJECTED", "SUSPENDED", "PENDING"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Allowed: VERIFIED, REJECTED, SUSPENDED, PENDING"
        )

    await db.providers.update_one(
        {"_id": p_oid},
        {"$set": {"verificationStatus": new_status, "updatedAt": datetime.now(timezone.utc)}}
    )

    # If SUSPENDED or REJECTED, deactivate linked user account so they cannot accept bookings or login
    user_id = provider.get("userId")
    if user_id:
        u_oid = parse_oid(user_id)
        is_active_flag = True if new_status == "VERIFIED" else False
        await db.users.update_one({"_id": u_oid}, {"$set": {"isActive": is_active_flag}})

        # Notify provider
        await db.notifications.insert_one({
            "userId": user_id,
            "title": "Account Status Updated",
            "message": f"Your provider account verification status has been updated to {new_status}.",
            "isRead": False,
            "createdAt": datetime.now(timezone.utc)
        })

    await log_admin_action(
        db, current_admin, f"PROVIDER_{new_status}", "PROVIDER", provider_id,
        f"Updated status for '{provider.get('businessName')}' to {new_status}"
    )

    return {"message": f"Provider verification status updated to {new_status}."}

@router.delete("/providers/{provider_id}")
async def delete_provider(
    provider_id: str,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    p_oid = parse_oid(provider_id)
    provider = await db.providers.find_one({"_id": p_oid})
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found.")

    # Check active bookings
    active_booking = await db.bookings.find_one({
        "providerId": provider_id,
        "status": {"$in": ["PENDING", "ACCEPTED", "STARTED"]}
    })

    if active_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This provider has active bookings. Complete or cancel them first, or suspend the account instead."
        )

    user_id = provider.get("userId")
    if user_id:
        u_oid = parse_oid(user_id)
        await db.users.delete_one({"_id": u_oid})
        await db.notifications.delete_many({"userId": user_id})

    # Anonymize historical booking records
    await db.bookings.update_many({"providerId": provider_id}, {"$set": {"providerName": "Deleted Provider"}})
    await db.reviews.update_many({"providerId": provider_id}, {"$set": {"providerName": "Deleted Provider"}})

    # Delete provider document
    await db.providers.delete_one({"_id": p_oid})

    await log_admin_action(
        db, current_admin, "DELETE_PROVIDER", "PROVIDER", provider_id,
        f"Permanently deleted provider '{provider.get('businessName')}'"
    )

    return {"message": "Provider profile permanently deleted."}

# --- Analytics Endpoint ---

@router.get("/analytics")
async def get_analytics(
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    monthly_data = [
        {"month": "Jan", "bookings": 45, "completed": 38, "cancelled": 4},
        {"month": "Feb", "bookings": 62, "completed": 54, "cancelled": 5},
        {"month": "Mar", "bookings": 88, "completed": 76, "cancelled": 8},
        {"month": "Apr", "bookings": 105, "completed": 92, "cancelled": 9},
        {"month": "May", "bookings": 130, "completed": 115, "cancelled": 10},
        {"month": "Jun", "bookings": 165, "completed": 148, "cancelled": 12}
    ]

    popular_services = [
        {"name": "AC Repair", "count": 145},
        {"name": "Electrician", "count": 120},
        {"name": "Plumber", "count": 98},
        {"name": "Washing Machine", "count": 76},
        {"name": "Home Cleaning", "count": 64}
    ]

    return {
        "monthlyBookings": monthly_data,
        "popularServices": popular_services
    }
