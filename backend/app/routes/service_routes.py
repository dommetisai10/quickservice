from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from app.database import get_database
from app.schemas.service_schema import ServiceCreateRequest, ServiceUpdateRequest, ServiceResponse
from app.dependencies.auth_deps import get_admin_user

router = APIRouter(prefix="/api/services", tags=["Services Management"])

@router.get("", response_model=List[ServiceResponse])
async def get_services(
    search: Optional[str] = Query(None),
    activeOnly: bool = Query(True),
    db=Depends(get_database)
):
    query = {}
    if activeOnly:
        query["isActive"] = True
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = db.services.find(query).sort("name", 1)
    services = await cursor.to_list(length=200)

    result = []
    for s in services:
        result.append(ServiceResponse(
            id=str(s["_id"]),
            name=s["name"],
            description=s["description"],
            image=s.get("image"),
            icon=s.get("icon"),
            startingPrice=s.get("startingPrice", 0.0),
            isActive=s.get("isActive", True)
        ))
    return result

@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service_by_id(service_id: str, db=Depends(get_database)):
    try:
        service = await db.services.find_one({"_id": ObjectId(service_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid service ID format.")
    
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service category not found.")

    return ServiceResponse(
        id=str(service["_id"]),
        name=service["name"],
        description=service["description"],
        image=service.get("image"),
        icon=service.get("icon"),
        startingPrice=service.get("startingPrice", 0.0),
        isActive=service.get("isActive", True)
    )

@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    req: ServiceCreateRequest,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    existing = await db.services.find_one({"name": {"$regex": f"^{req.name}$", "$options": "i"}})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A service category with this name already exists."
        )
    
    now = datetime.now(timezone.utc)
    service_doc = {
        "name": req.name,
        "description": req.description,
        "image": req.image or "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
        "icon": req.icon or "Wrench",
        "startingPrice": req.startingPrice,
        "isActive": req.isActive,
        "createdAt": now,
        "updatedAt": now
    }

    res = await db.services.insert_one(service_doc)
    service_id = str(res.inserted_id)

    return ServiceResponse(
        id=service_id,
        name=req.name,
        description=req.description,
        image=service_doc["image"],
        icon=service_doc["icon"],
        startingPrice=req.startingPrice,
        isActive=req.isActive
    )

@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str,
    req: ServiceUpdateRequest,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    try:
        oid = ObjectId(service_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid service ID format.")
    
    service = await db.services.find_one({"_id": oid})
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service category not found.")

    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.now(timezone.utc)

    await db.services.update_one({"_id": oid}, {"$set": update_data})
    updated = await db.services.find_one({"_id": oid})

    return ServiceResponse(
        id=str(updated["_id"]),
        name=updated["name"],
        description=updated["description"],
        image=updated.get("image"),
        icon=updated.get("icon"),
        startingPrice=updated.get("startingPrice", 0.0),
        isActive=updated.get("isActive", True)
    )

@router.delete("/{service_id}", status_code=status.HTTP_200_OK)
async def delete_service(
    service_id: str,
    current_admin=Depends(get_admin_user),
    db=Depends(get_database)
):
    try:
        oid = ObjectId(service_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid service ID format.")
    
    result = await db.services.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service category not found.")
    
    return {"message": f"Service category {service_id} deleted successfully."}
