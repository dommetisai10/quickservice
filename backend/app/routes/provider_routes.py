from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from app.database import get_database
from app.schemas.provider_schema import ProviderUpdateRequest, ProviderVerifyRequest
from app.dependencies.auth_deps import get_current_user, get_admin_user

router = APIRouter(prefix="/api/providers", tags=["Provider Management"])

@router.get("")
async def get_providers(
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    minRating: float = Query(0.0),
    maxPrice: Optional[float] = Query(None),
    minExperience: int = Query(0),
    availableOnly: bool = Query(False),
    verificationStatus: str = Query("VERIFIED"),
    db=Depends(get_database)
):
    query = {}
    if verificationStatus != "ALL":
        query["verificationStatus"] = verificationStatus

    if category:
        query["serviceCategories"] = category

    if city:
        query["city"] = {"$regex": city, "$options": "i"}

    if availableOnly:
        query["isAvailable"] = True

    if minRating > 0:
        query["rating"] = {"$gte": minRating}

    if minExperience > 0:
        query["experience"] = {"$gte": minExperience}

    if maxPrice is not None:
        query["hourlyRate"] = {"$lte": maxPrice}

    if search:
        query["$or"] = [
            {"businessName": {"$regex": search, "$options": "i"}},
            {"fullName": {"$regex": search, "$options": "i"}},
            {"serviceCategories": {"$regex": search, "$options": "i"}}
        ]

    cursor = db.providers.find(query).sort("rating", -1)
    providers = await cursor.to_list(length=100)

    result = []
    for p in providers:
        p["_id"] = str(p["_id"])
        p["userId"] = str(p["userId"])
        result.append(p)
    return result

@router.get("/{provider_id}")
async def get_provider_by_id(provider_id: str, db=Depends(get_database)):
    try:
        oid = ObjectId(provider_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid provider ID format.")
    
    provider = await db.providers.find_one({"_id": oid})
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found.")

    provider["_id"] = str(provider["_id"])
    provider["userId"] = str(provider["userId"])

    # Fetch provider reviews
    reviews_cursor = db.reviews.find({"providerId": oid}).sort("createdAt", -1)
    reviews = await reviews_cursor.to_list(length=20)
    
    formatted_reviews = []
    for r in reviews:
        cust = await db.users.find_one({"_id": r["customerId"]})
        formatted_reviews.append({
            "id": str(r["_id"]),
            "customerName": cust["fullName"] if cust else "Anonymous Customer",
            "rating": r["rating"],
            "comment": r["comment"],
            "date": r["createdAt"].strftime("%Y-%m-%d") if isinstance(r.get("createdAt"), datetime) else "2026-03-15"
        })

    provider["reviews"] = formatted_reviews
    return provider

@router.put("/{provider_id}")
async def update_provider_profile(
    provider_id: str,
    req: ProviderUpdateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    try:
        oid = ObjectId(provider_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid provider ID format.")
    
    provider = await db.providers.find_one({"_id": oid})
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found.")

    # Authorization Check: User must own the provider account or be ADMIN
    if current_user["role"] != "ADMIN" and str(provider["userId"]) != current_user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this provider profile."
        )

    update_dict = {k: v for k, v in req.model_dump().items() if v is not None}
    if "workingHours" in update_dict and isinstance(update_dict["workingHours"], dict):
        pass # Handle nested dict
    update_dict["updatedAt"] = datetime.now(timezone.utc)

    await db.providers.update_one({"_id": oid}, {"$set": update_dict})
    updated_provider = await db.providers.find_one({"_id": oid})
    
    updated_provider["_id"] = str(updated_provider["_id"])
    updated_provider["userId"] = str(updated_provider["userId"])
    return updated_provider

@router.put("/{provider_id}/verify")
async def verify_provider(
    provider_id: str,
    req: ProviderVerifyRequest,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    try:
        oid = ObjectId(provider_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid provider ID format.")
    
    provider = await db.providers.find_one({"_id": oid})
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found.")

    valid_statuses = ["VERIFIED", "REJECTED", "SUSPENDED", "PENDING"]
    if req.status not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid verification status. Must be one of {valid_statuses}")

    await db.providers.update_one(
        {"_id": oid},
        {"$set": {"verificationStatus": req.status, "adminNotes": req.adminNotes, "updatedAt": datetime.now(timezone.utc)}}
    )

    # Notify provider user
    now = datetime.now(timezone.utc)
    notification_doc = {
        "userId": provider["userId"],
        "title": f"Provider Status Updated: {req.status}",
        "message": f"Your service provider verification status has been updated to {req.status} by Admin.",
        "type": "VERIFICATION_UPDATE",
        "isRead": False,
        "createdAt": now
    }
    await db.notifications.insert_one(notification_doc)

    return {"message": f"Provider verification status updated to '{req.status}' successfully."}
