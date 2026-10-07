from typing import Optional
from pydantic import BaseModel, Field

class ServiceCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=5, max_length=1000)
    image: Optional[str] = None
    icon: Optional[str] = None
    startingPrice: float = Field(..., ge=0)
    isActive: bool = True

class ServiceUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None
    startingPrice: Optional[float] = None
    isActive: Optional[bool] = None

class ServiceResponse(BaseModel):
    id: str
    name: str
    description: str
    image: Optional[str] = None
    icon: Optional[str] = None
    startingPrice: float
    isActive: bool
