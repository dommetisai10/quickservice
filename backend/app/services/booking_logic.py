from datetime import datetime
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

VALID_TRANSITIONS = {
    "PENDING": ["ACCEPTED", "REJECTED", "CANCELLED"],
    "ACCEPTED": ["STARTED"],
    "STARTED": ["COMPLETED"],
    "REJECTED": [],
    "COMPLETED": [],
    "CANCELLED": []
}

async def generate_unique_booking_id(db: AsyncIOMotorDatabase) -> str:
    """
    Generates a unique, zero-padded sequential booking ID format: QS-2026-000001
    """
    year = datetime.now().year
    
    # Use atomic counter collection to prevent sequence collision
    counter_doc = await db.counters.find_one_and_update(
        {"_id": f"booking_seq_{year}"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    
    seq_number = counter_doc.get("seq", 1)
    return f"QS-{year}-{seq_number:06d}"

def validate_status_transition(current_status: str, target_status: str, user_role: str):
    """
    Validates state machine transitions according to system authorization rules.
    """
    if target_status not in VALID_TRANSITIONS.get(current_status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid booking status transition from '{current_status}' to '{target_status}'."
        )

    if target_status == "CANCELLED" and user_role != "CUSTOMER" and user_role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the customer who placed this booking can cancel it."
        )

    if target_status in ["ACCEPTED", "REJECTED", "STARTED", "COMPLETED"] and user_role != "PROVIDER" and user_role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the assigned provider can update job execution status."
        )
