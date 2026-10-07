from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.database import get_database
from app.dependencies.auth_deps import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
async def get_notifications(
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    cursor = db.notifications.find({"userId": ObjectId(current_user["_id"])}).sort("createdAt", -1)
    notifications = await cursor.to_list(length=50)

    result = []
    for n in notifications:
        result.append({
            "id": str(n["_id"]),
            "title": n["title"],
            "message": n["message"],
            "type": n["type"],
            "isRead": n.get("isRead", False),
            "createdAt": n["createdAt"].strftime("%Y-%m-%d %H:%M") if isinstance(n.get("createdAt"), datetime) else str(n.get("createdAt"))
        })
    return result

@router.put("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    try:
        oid = ObjectId(notification_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification ID format.")

    await db.notifications.update_one(
        {"_id": oid, "userId": ObjectId(current_user["_id"])},
        {"$set": {"isRead": True}}
    )

    return {"message": "Notification marked as read."}

@router.put("/read-all")
async def mark_all_read(
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    await db.notifications.update_many(
        {"userId": ObjectId(current_user["_id"]), "isRead": False},
        {"$set": {"isRead": True}}
    )
    return {"message": "All notifications marked as read."}
