import os
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "QuickService"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # MongoDB Database Settings
    MONGODB_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "quickservice_db"

    # JWT Authentication Settings
    JWT_SECRET: str = "quickservice_super_secret_jwt_key_2026_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS Settings
    FRONTEND_URL: str = "http://localhost:5173"

    # Initial System Admin Credentials (Loaded securely from environment variables)
    ADMIN_EMAIL: str = "admin@quickservice.com"
    ADMIN_PASSWORD: str = "Admin@QuickService2026"
    ADMIN_NAME: str = "System Admin"
    ADMIN_PHONE: str = "9876543210"

    @field_validator("MONGODB_URI")
    def validate_mongodb_uri(cls, v):
        if not v or not v.strip():
            raise ValueError("CRITICAL: MONGODB_URI environment variable is missing or empty!")
        return v

    @field_validator("JWT_SECRET")
    def validate_jwt_secret(cls, v, info):
        if not v or not v.strip():
            raise ValueError("CRITICAL: JWT_SECRET environment variable is missing or empty!")
        return v

settings = Settings()
