from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class WorkingHours(BaseModel):
    start: str = "09:00 AM"
    end: str = "06:00 PM"

class ProviderUpdateRequest(BaseModel):
    businessName: Optional[str] = None
    serviceCategories: Optional[List[str]] = None
    description: Optional[str] = None
    experience: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    serviceRadius: Optional[float] = None
    hourlyRate: Optional[float] = None
    profileImage: Optional[str] = None
    isAvailable: Optional[bool] = None
    workingDays: Optional[List[str]] = None
    workingHours: Optional[WorkingHours] = None

class ProviderVerifyRequest(BaseModel):
    status: str = Field(..., description="VERIFIED, REJECTED, SUSPENDED, PENDING")
    adminNotes: Optional[str] = None
