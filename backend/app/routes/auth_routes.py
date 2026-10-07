from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from bson import ObjectId
from app.database import get_database
from app.schemas.user_schema import (
    CustomerRegisterRequest,
    ProviderRegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse
)
from app.utils.auth_utils import hash_password, verify_password, create_access_token
from app.dependencies.auth_deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class ProfileUpdateRequest(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    profileImage: Optional[str] = None

@router.post("/register/customer", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_customer(req: CustomerRegisterRequest, db=Depends(get_database)):
    # Duplicate email check: Return 409 Conflict "Email already registered."
    existing_user = await db.users.find_one({"email": req.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered."
        )

    now = datetime.now(timezone.utc)
    hashed_pwd = hash_password(req.password)

    user_doc = {
        "fullName": req.fullName,
        "email": req.email.lower(),
        "phone": req.phone,
        "passwordHash": hashed_pwd,
        "role": "CUSTOMER",
        "profileImage": f"https://api.dicebear.com/7.x/avataaars/svg?seed={req.fullName.replace(' ', '')}",
        "address": req.address,
        "city": req.city,
        "state": req.state,
        "pincode": req.pincode,
        "isActive": True,
        "createdAt": now,
        "updatedAt": now
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    access_token = create_access_token({"sub": user_id, "role": "CUSTOMER", "email": req.email.lower()})

    user_response = UserResponse(
        id=user_id,
        fullName=req.fullName,
        email=req.email.lower(),
        phone=req.phone,
        role="CUSTOMER",
        profileImage=user_doc["profileImage"],
        address=req.address,
        city=req.city,
        state=req.state,
        pincode=req.pincode,
        isActive=True
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)

@router.post("/register/provider", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_provider(req: ProviderRegisterRequest, db=Depends(get_database)):
    # Duplicate email check: Return 409 Conflict "Email already registered."
    existing_user = await db.users.find_one({"email": req.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered."
        )

    now = datetime.now(timezone.utc)
    hashed_pwd = hash_password(req.password)

    user_doc = {
        "fullName": req.fullName,
        "email": req.email.lower(),
        "phone": req.phone,
        "passwordHash": hashed_pwd,
        "role": "PROVIDER",
        "profileImage": f"https://api.dicebear.com/7.x/avataaars/svg?seed={req.businessName.replace(' ', '')}",
        "address": req.address,
        "city": req.city,
        "state": req.state,
        "pincode": req.pincode,
        "isActive": True,
        "createdAt": now,
        "updatedAt": now
    }

    user_result = await db.users.insert_one(user_doc)
    user_id = user_result.inserted_id

    # Provider profile document initialized with verificationStatus = PENDING
    provider_doc = {
        "userId": user_id,
        "businessName": req.businessName,
        "serviceCategories": req.serviceCategories,
        "description": req.description,
        "experience": req.experience,
        "phone": req.phone,
        "email": req.email.lower(),
        "address": req.address,
        "city": req.city,
        "state": req.state,
        "pincode": req.pincode,
        "serviceRadius": req.serviceRadius,
        "hourlyRate": req.hourlyRate,
        "profileImage": user_doc["profileImage"],
        "verificationStatus": "PENDING",  # Requires Admin Approval
        "rating": 0.0,
        "totalReviews": 0,
        "completedJobs": 0,
        "isAvailable": True,
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "workingHours": {"start": "09:00 AM", "end": "06:00 PM"},
        "createdAt": now,
        "updatedAt": now
    }

    provider_result = await db.providers.insert_one(provider_doc)
    provider_id = str(provider_result.inserted_id)

    access_token = create_access_token({"sub": str(user_id), "role": "PROVIDER", "email": req.email.lower()})

    user_response = UserResponse(
        id=str(user_id),
        fullName=req.fullName,
        email=req.email.lower(),
        phone=req.phone,
        role="PROVIDER",
        profileImage=user_doc["profileImage"],
        address=req.address,
        city=req.city,
        state=req.state,
        pincode=req.pincode,
        isActive=True,
        providerId=provider_id,
        verificationStatus="PENDING"
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db=Depends(get_database)):
    user = await db.users.find_one({"email": req.email.lower()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(req.password, user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.get("isActive", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    user_id_str = str(user["_id"])
    provider_id_str = None
    verification_status = None

    if user["role"] == "PROVIDER":
        provider_doc = await db.providers.find_one({"userId": user["_id"]})
        if provider_doc:
            provider_id_str = str(provider_doc["_id"])
            verification_status = provider_doc.get("verificationStatus", "PENDING")

    access_token = create_access_token({"sub": user_id_str, "role": user["role"], "email": user["email"]})

    user_response = UserResponse(
        id=user_id_str,
        fullName=user["fullName"],
        email=user["email"],
        phone=user["phone"],
        role=user["role"],
        profileImage=user.get("profileImage"),
        address=user.get("address", ""),
        city=user.get("city", ""),
        state=user.get("state", ""),
        pincode=user.get("pincode", ""),
        isActive=user.get("isActive", True),
        providerId=provider_id_str,
        verificationStatus=verification_status
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["_id"],
        fullName=current_user["fullName"],
        email=current_user["email"],
        phone=current_user["phone"],
        role=current_user["role"],
        profileImage=current_user.get("profileImage"),
        address=current_user.get("address", ""),
        city=current_user.get("city", ""),
        state=current_user.get("state", ""),
        pincode=current_user.get("pincode", ""),
        isActive=current_user.get("isActive", True),
        providerId=current_user.get("providerId"),
        verificationStatus=current_user.get("verificationStatus")
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    req: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    user_oid = ObjectId(current_user["_id"])
    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.now(timezone.utc)

    await db.users.update_one({"_id": user_oid}, {"$set": update_data})
    
    # If user is provider, sync profile fields to provider document
    if current_user["role"] == "PROVIDER":
        provider_update = {}
        if "phone" in update_data: provider_update["phone"] = update_data["phone"]
        if "address" in update_data: provider_update["address"] = update_data["address"]
        if "city" in update_data: provider_update["city"] = update_data["city"]
        if "state" in update_data: provider_update["state"] = update_data["state"]
        if "pincode" in update_data: provider_update["pincode"] = update_data["pincode"]
        if "profileImage" in update_data: provider_update["profileImage"] = update_data["profileImage"]
        
        if provider_update:
            await db.providers.update_one({"userId": user_oid}, {"$set": provider_update})

    updated_user = await db.users.find_one({"_id": user_oid})

    provider_id_str = current_user.get("providerId")
    verification_status = current_user.get("verificationStatus")

    return UserResponse(
        id=str(updated_user["_id"]),
        fullName=updated_user["fullName"],
        email=updated_user["email"],
        phone=updated_user["phone"],
        role=updated_user["role"],
        profileImage=updated_user.get("profileImage"),
        address=updated_user.get("address", ""),
        city=updated_user.get("city", ""),
        state=updated_user.get("state", ""),
        pincode=updated_user.get("pincode", ""),
        isActive=updated_user.get("isActive", True),
        providerId=provider_id_str,
        verificationStatus=verification_status
    )
