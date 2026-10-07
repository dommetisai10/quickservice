from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field

PREDEFINED_TIME_SLOTS = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM"
]

class BookingCreateRequest(BaseModel):
    providerId: str = Field(..., description="Target Provider MongoDB ObjectId string")
    serviceId: Optional[str] = None
    serviceName: str = Field(..., description="Name of selected service category")
    bookingDate: str = Field(..., description="Booking date formatted YYYY-MM-DD")
    timeSlot: str = Field(..., description="One of predefined 1-hour time slots")
    address: str = Field(..., min_length=5)
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    pincode: str = Field(..., min_length=5, max_length=10)
    description: str = Field(..., min_length=5, max_length=1000, description="Problem description")
    customerNotes: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    bookingId: str
    customerId: str
    customerName: str
    customerPhone: str
    providerId: str
    providerBusinessName: str
    providerPhone: str
    serviceName: str
    bookingDate: str
    timeSlot: str
    address: str
    city: str
    state: str
    pincode: str
    description: str
    estimatedPrice: float
    finalPrice: float
    status: str
    customerNotes: Optional[str] = None
    providerNotes: Optional[str] = None
    createdAt: str
    updatedAt: str

class AvailableSlotsResponse(BaseModel):
    providerId: str
    bookingDate: str
    availableSlots: List[str]
    bookedSlots: List[str]
