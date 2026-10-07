import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, db_instance
from app.routes import (
    auth_routes, 
    service_routes, 
    provider_routes, 
    admin_routes, 
    booking_routes, 
    review_routes, 
    complaint_routes, 
    notification_routes
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB and initialize indexes
    await connect_to_mongo()
    yield
    # Shutdown: Close MongoDB connection
    await close_mongo_connection()

is_production = settings.ENVIRONMENT.lower() == "production"

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="QuickService REST API backend supporting Customers, Providers, and Admins.",
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    lifespan=lifespan
)

# CORS Middleware Configuration
raw_origins = [origin.strip().rstrip("/") for origin in settings.FRONTEND_URL.split(",") if origin.strip()]

if is_production:
    origins = raw_origins
else:
    default_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
    origins = list(set(raw_origins + default_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_routes.router)
app.include_router(service_routes.router)
app.include_router(provider_routes.router)
app.include_router(admin_routes.router)
app.include_router(booking_routes.router)
app.include_router(review_routes.router)
app.include_router(complaint_routes.router)
app.include_router(notification_routes.router)

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "environment": settings.ENVIRONMENT
    }

@app.get("/api/health")
async def health_check():
    try:
        if db_instance.client:
            await db_instance.client.admin.command('ping')
            db_status = "connected"
        else:
            db_status = "disconnected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "ok",
        "message": "QuickService backend is running",
        "database": db_status
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=not is_production)
