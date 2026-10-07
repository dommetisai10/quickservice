from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator

class CustomerRegisterRequest(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=100, description="Full name of customer")
    email: EmailStr = Field(..., description="Valid email address")
    phone: str = Field(..., min_length=10, max_length=15, description="Phone number")
    password: str = Field(..., min_length=6, description="Password at least 6 characters")
    address: str = Field(..., min_length=5, description="Street address")
    city: str = Field(..., min_length=2, description="City name")
    state: str = Field(..., min_length=2, description="State name")
    pincode: str = Field(..., min_length=5, max_length=10, description="Postal pincode")

class ProviderRegisterRequest(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=100)
    email: EmailStr = Field(...)
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    businessName: str = Field(..., min_length=2, max_length=100)
    serviceCategories: List[str] = Field(..., min_items=1, description="List of service IDs or names")
    description: str = Field(..., min_length=10, max_length=1000)
    experience: int = Field(..., ge=0, description="Years of experience")
    address: str = Field(..., min_length=5)
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    pincode: str = Field(..., min_length=5, max_length=10)
    serviceRadius: float = Field(..., gt=0, description="Service radius in kilometers")
    hourlyRate: float = Field(..., gt=0, description="Service starting price or hourly rate in INR")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    fullName: str
    email: str
    phone: str
    role: str
    profileImage: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str
    isActive: bool
    providerId: Optional[str] = None
    verificationStatus: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
