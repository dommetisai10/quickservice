from typing import Optional
from pydantic import BaseModel, Field

class ComplaintCreateRequest(BaseModel):
    bookingId: str = Field(...)
    subject: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)

class ComplaintUpdateRequest(BaseModel):
    status: str = Field(..., description="OPEN, IN_PROGRESS, RESOLVED, CLOSED")
    adminResponse: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: str
    bookingId: str
    customerId: str
    customerName: str
    providerId: str
    providerBusinessName: str
    subject: str
    description: str
    status: str
    adminResponse: Optional[str] = None
    createdAt: str
    updatedAt: str
