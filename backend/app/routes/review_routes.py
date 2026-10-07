from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.database import get_database
from app.schemas.review_schema import ReviewCreateRequest, ReviewResponse
from app.dependencies.auth_deps import get_customer_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews & Ratings"])

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    req: ReviewCreateRequest,
    current_customer=Depends(get_customer_user),
    db=Depends(get_database)
):
    # Fetch target booking
    try:
        booking_oid = ObjectId(req.bookingId)
        booking = await db.bookings.find_one({"_id": booking_oid})
    except Exception:
        booking = await db.bookings.find_one({"bookingId": req.bookingId})

    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking record not found.")

    # Only customer who made the booking can review
    if str(booking["customerId"]) != current_customer["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are only authorized to review your own bookings."
        )

    # Must be COMPLETED
    if booking["status"] != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only submit a review after the service job is marked COMPLETED."
        )

    # Enforce 1 booking = 1 review
    existing_review = await db.reviews.find_one({"bookingId": booking["_id"]})
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A review has already been submitted for this booking."
        )

    now = datetime.now(timezone.utc)
    review_doc = {
        "bookingId": booking["_id"],
        "customerId": ObjectId(current_customer["_id"]),
        "providerId": booking["providerId"],
        "rating": req.rating,
        "comment": req.comment,
        "createdAt": now
    }

    result = await db.reviews.insert_one(review_doc)

    # Recalculate provider average rating and total reviews
    reviews_cursor = db.reviews.find({"providerId": booking["providerId"]})
    all_reviews = await reviews_cursor.to_list(length=1000)
    
    total_count = len(all_reviews)
    avg_rating = sum(r["rating"] for r in all_reviews) / total_count if total_count > 0 else 0.0

    await db.providers.update_one(
        {"_id": booking["providerId"]},
        {"$set": {"rating": round(avg_rating, 1), "totalReviews": total_count}}
    )

    return ReviewResponse(
        id=str(result.inserted_id),
        bookingId=booking["bookingId"],
        customerId=current_customer["_id"],
        customerName=current_customer["fullName"],
        providerId=str(booking["providerId"]),
        rating=req.rating,
        comment=req.comment,
        createdAt=now.strftime("%Y-%m-%d")
    )

@router.get("/provider/{provider_id}")
async def get_provider_reviews(provider_id: str, db=Depends(get_database)):
    try:
        provider_oid = ObjectId(provider_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid provider ID format.")

    cursor = db.reviews.find({"providerId": provider_oid}).sort("createdAt", -1)
    reviews = await cursor.to_list(length=100)

    result = []
    for r in reviews:
        cust = await db.users.find_one({"_id": r["customerId"]})
        result.append({
            "id": str(r["_id"]),
            "bookingId": str(r["bookingId"]),
            "customerId": str(r["customerId"]),
            "customerName": cust["fullName"] if cust else "Anonymous Customer",
            "rating": r["rating"],
            "comment": r["comment"],
            "createdAt": r["createdAt"].strftime("%Y-%m-%d") if isinstance(r.get("createdAt"), datetime) else "2026-03-15"
        })
    return result
