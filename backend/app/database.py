import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
from app.utils.auth_utils import hash_password

logger = logging.getLogger("quickservice.database")

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = Database()

async def get_database() -> AsyncIOMotorDatabase:
    return db_instance.db

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB database: {settings.DB_NAME}")
    try:
        db_instance.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
        db_instance.db = db_instance.client[settings.DB_NAME]
        
        # Ping MongoDB server to verify connection
        await db_instance.client.admin.command('ping')
        print("==================================================")
        print(f"[SUCCESS] MongoDB connected successfully to database '{settings.DB_NAME}'")
        print("==================================================")
        logger.info(f"MongoDB connected successfully to database '{settings.DB_NAME}'")

        # Initialize indexes and startup seed
        await init_indexes()
        await init_admin()
        await init_default_services()

    except Exception as e:
        print("==================================================")
        print(f"[ERROR] MONGODB CONNECTION ERROR: {str(e)}")
        print("==================================================")
        logger.error(f"MongoDB connection failed: {e}")
        # Print Atlas connection advice
        print("\n[INFO] MONGODB TROUBLESHOOTING CHECKLIST:")
        print("1. If using MongoDB Atlas, verify your connection string in backend/.env")
        print("2. Ensure username and password are correct (URL-encode special characters like @, #, ! in password)")
        print("3. Check MongoDB Atlas Network Access: Whitelist your current IP address or add 0.0.0.0/0 for development")
        print("4. Check that your cluster is ACTIVE and not paused\n")

async def close_mongo_connection():
    if db_instance.client:
        logger.info("Closing MongoDB connection...")
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

async def init_indexes():
    db = db_instance.db
    logger.info("Initializing database indexes...")

    try:
        # 1. Users collection indexes
        await db.users.create_index("email", unique=True, name="idx_users_email_unique")

        # 2. Providers collection indexes
        await db.providers.create_index("city", name="idx_providers_city")
        await db.providers.create_index("serviceCategories", name="idx_providers_service_categories")
        await db.providers.create_index("verificationStatus", name="idx_providers_verification_status")

        # 3. Services collection indexes
        await db.services.create_index("name", unique=True, name="idx_services_name_unique")
        await db.services.create_index("isActive", name="idx_services_is_active")

        # 4. Bookings collection indexes
        await db.bookings.create_index("customerId", name="idx_bookings_customer_id")
        await db.bookings.create_index("providerId", name="idx_bookings_provider_id")
        await db.bookings.create_index("status", name="idx_bookings_status")

        # CRITICAL Double Booking Prevention Partial Unique Compound Index
        await db.bookings.create_index(
            [("providerId", 1), ("bookingDate", 1), ("timeSlot", 1)],
            unique=True,
            partialFilterExpression={"status": {"$in": ["PENDING", "ACCEPTED", "STARTED"]}},
            name="idx_unique_active_provider_timeslot"
        )

        # 5. Reviews collection indexes
        await db.reviews.create_index("providerId", name="idx_reviews_provider_id")
        await db.reviews.create_index("bookingId", unique=True, name="idx_reviews_booking_id_unique")

        # 6. Complaints collection indexes
        await db.complaints.create_index("customerId", name="idx_complaints_customer_id")
        await db.complaints.create_index("status", name="idx_complaints_status")

        # 7. Notifications collection indexes
        await db.notifications.create_index("userId", name="idx_notifications_user_id")
        await db.notifications.create_index([("userId", 1), ("isRead", 1)], name="idx_notifications_user_unread")

        logger.info("Database indexes initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database indexes: {e}")

async def init_admin():
    """Startup auto-creation of system admin user if not present."""
    db = db_instance.db
    admin_email = settings.ADMIN_EMAIL.lower()
    
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        logger.info(f"Creating System Admin user for '{admin_email}'...")
        now = datetime.now(timezone.utc)
        admin_doc = {
            "fullName": settings.ADMIN_NAME,
            "email": admin_email,
            "phone": settings.ADMIN_PHONE,
            "passwordHash": hash_password(settings.ADMIN_PASSWORD),
            "role": "ADMIN",
            "profileImage": "https://api.dicebear.com/7.x/avataaars/svg?seed=SystemAdmin",
            "address": "101 QuickService Admin Tower",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        }
        await db.users.insert_one(admin_doc)
        logger.info(f"System Admin account created successfully ({admin_email}).")

async def init_default_services():
    """Auto-seeds default service categories if db.services is empty."""
    db = db_instance.db
    count = await db.services.count_documents({})
    if count == 0:
        logger.info("Seeding default service categories into database...")
        now = datetime.now(timezone.utc)
        services_list = [
            { "name": "AC Repair", "description": "Complete AC servicing, gas refilling, compressor repair, and installation.", "startingPrice": 499.0, "image": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80", "icon": "AirVent", "isActive": True, "createdAt": now, "updatedAt": now },
            { "name": "Washing Machine Repair", "description": "Front & top load washing machine drum fix, motor replacement, and drainage service.", "startingPrice": 399.0, "image": "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80", "icon": "Disc", "isActive": True, "createdAt": now, "updatedAt": now },
            { "name": "Refrigerator Repair", "description": "Fridge cooling restoration, thermostat replacement, compressor check, and door seal fix.", "startingPrice": 449.0, "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80", "icon": "Box", "isActive": True, "createdAt": now, "updatedAt": now },
            { "name": "Electrician", "description": "House wiring, circuit breaker maintenance, light fittings, and electrical fault detection.", "startingPrice": 299.0, "image": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80", "icon": "Zap", "isActive": True, "createdAt": now, "updatedAt": now },
            { "name": "Plumber", "description": "Pipe leakage repair, tap fitting, bathroom drainage, and pipeline installation.", "startingPrice": 349.0, "image": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80", "icon": "Droplets", "isActive": True, "createdAt": now, "updatedAt": now },
            { "name": "Carpenter", "description": "Woodwork repair, furniture assembly, door lock fitting, and modular kitchen adjustments.", "startingPrice": 399.0, "image": "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=600&q=80", "icon": "Hammer", "isActive": True, "createdAt": now, "updatedAt": now },
            { "name": "Painter", "description": "Wall painting, waterproof coating, exterior texture, and home color consultation.", "startingPrice": 1499.0, "image": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80", "icon": "Paintbrush", "isActive": True, "createdAt": now, "updatedAt": now },
            { "name": "Home Cleaning", "description": "Full home deep sanitization, sofa shampooing, kitchen degreasing, and bathroom scrub.", "startingPrice": 999.0, "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80", "icon": "Sparkles", "isActive": True, "createdAt": now, "updatedAt": now },
            { "name": "TV Repair", "description": "LED & LCD TV screen repair, motherboard servicing, and wall bracket mounting.", "startingPrice": 499.0, "image": "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80", "icon": "Tv", "isActive": True, "createdAt": now, "updatedAt": now },
            { "name": "RO Water Purifier Service", "description": "Filter replacement, RO membrane flush, water TDS testing, and leak repair.", "startingPrice": 299.0, "image": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80", "icon": "Water", "isActive": True, "createdAt": now, "updatedAt": now },
            { "name": "Pest Control", "description": "Cockroach gel treatment, termite control, bed bug eradication, and mosquito fogging.", "startingPrice": 799.0, "image": "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80", "icon": "Bug", "isActive": True, "createdAt": now, "updatedAt": now }
        ]
        await db.services.insert_many(services_list)
        logger.info(f"Successfully auto-seeded {len(services_list)} default services.")
