from pydantic import BaseModel, Field

class ReviewCreateRequest(BaseModel):
    bookingId: str = Field(..., description="Completed Booking ID")
    rating: int = Field(..., ge=1, le=5, description="1 to 5 star rating")
    comment: str = Field(..., min_length=3, max_length=1000)

class ReviewResponse(BaseModel):
    id: str
    bookingId: str
    customerId: str
    customerName: str
    providerId: str
    rating: int
    comment: str
    createdAt: str
