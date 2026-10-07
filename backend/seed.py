"""
=============================================================================
QuickService Seed Script (Development Data Population)
=============================================================================
WARNING: Sample credentials created in this script are for LOCAL DEVELOPMENT ONLY.
Never use default seed credentials in a production environment!
=============================================================================
"""

import asyncio
import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.utils.auth_utils import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("quickservice.seed")

async def seed_database():
    logger.info("Connecting to MongoDB for seeding...")
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DB_NAME]

    logger.info("Cleaning existing collections for fresh seed...")
    await db.users.delete_many({})
    await db.providers.delete_many({})
    await db.services.delete_many({})
    await db.bookings.delete_many({})
    await db.reviews.delete_many({})
    await db.complaints.delete_many({})
    await db.notifications.delete_many({})
    await db.counters.delete_many({})

    now = datetime.now(timezone.utc)

    # 1. Seed System Admin User (No public register route allowed!)
    logger.info("Creating System Admin user...")
    admin_password_hash = hash_password(settings.ADMIN_PASSWORD)
    admin_user = {
        "fullName": settings.ADMIN_NAME,
        "email": settings.ADMIN_EMAIL.lower(),
        "phone": settings.ADMIN_PHONE,
        "passwordHash": admin_password_hash,
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
    await db.users.insert_one(admin_user)
    logger.info(f"Admin User created: {settings.ADMIN_EMAIL}")

    # 2. Seed Services Categories
    logger.info("Seeding Service Categories...")
    services_list = [
        {
            "name": "AC Repair",
            "description": "Complete AC servicing, gas refilling, compressor repair, and installation.",
            "startingPrice": 499.0,
            "image": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
            "icon": "AirVent",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "name": "Washing Machine Repair",
            "description": "Front & top load washing machine drum fix, motor replacement, and drainage service.",
            "startingPrice": 399.0,
            "image": "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80",
            "icon": "Disc",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "name": "Refrigerator Repair",
            "description": "Fridge cooling restoration, thermostat replacement, compressor check, and door seal fix.",
            "startingPrice": 449.0,
            "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
            "icon": "Box",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "name": "Electrician",
            "description": "House wiring, circuit breaker maintenance, light fittings, and electrical fault detection.",
            "startingPrice": 299.0,
            "image": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80",
            "icon": "Zap",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "name": "Plumber",
            "description": "Pipe leakage repair, tap fitting, bathroom drainage, and pipeline installation.",
            "startingPrice": 349.0,
            "image": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
            "icon": "Droplets",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "name": "Carpenter",
            "description": "Woodwork repair, furniture assembly, door lock fitting, and modular kitchen adjustments.",
            "startingPrice": 399.0,
            "image": "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=600&q=80",
            "icon": "Hammer",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "name": "Painter",
            "description": "Wall painting, waterproof coating, exterior texture, and home color consultation.",
            "startingPrice": 1499.0,
            "image": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80",
            "icon": "Paintbrush",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "name": "Home Cleaning",
            "description": "Full home deep sanitization, sofa shampooing, kitchen degreasing, and bathroom scrub.",
            "startingPrice": 999.0,
            "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
            "icon": "Sparkles",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "name": "TV Repair",
            "description": "LED & LCD TV screen repair, motherboard servicing, and wall bracket mounting.",
            "startingPrice": 499.0,
            "image": "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80",
            "icon": "Tv",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "name": "RO Water Purifier Service",
            "description": "Filter replacement, RO membrane flush, water TDS testing, and leak repair.",
            "startingPrice": 299.0,
            "image": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
            "icon": "Water",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "name": "Pest Control",
            "description": "Cockroach gel treatment, termite control, bed bug eradication, and mosquito fogging.",
            "startingPrice": 799.0,
            "image": "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80",
            "icon": "Bug",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        }
    ]
    await db.services.insert_many(services_list)
    logger.info(f"Seeded {len(services_list)} service categories.")

    # 3. Seed Sample Customer User
    logger.info("Creating Sample Customer...")
    customer_user = {
        "fullName": "Amit Patel",
        "email": "customer@quickservice.com",
        "phone": "9876543220",
        "passwordHash": hash_password("CustomerPass123!"),
        "role": "CUSTOMER",
        "profileImage": "https://api.dicebear.com/7.x/avataaars/svg?seed=AmitPatel",
        "address": "402 Park View Apartments, Bandra West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400050",
        "isActive": True,
        "createdAt": now,
        "updatedAt": now
    }
    cust_res = await db.users.insert_one(customer_user)
    customer_id = cust_res.inserted_id
    logger.info("Customer user created: customer@quickservice.com (Pass: CustomerPass123!)")

    # 4. Seed Verified Provider Users
    logger.info("Seeding Sample Verified Providers...")
    provider_users_data = [
        {
            "fullName": "Rahul Sharma",
            "email": "provider.rahul@quickservice.com",
            "phone": "9876543210",
            "passwordHash": hash_password("ProviderPass123!"),
            "businessName": "Apex Electrical & AC Care",
            "serviceCategories": ["Electrician", "AC Repair"],
            "description": "Certified electrical repair specialist with over 8 years of field experience in residential wiring and AC servicing. We use genuine spare parts and offer a 30-day service warranty.",
            "experience": 8,
            "address": "102 Industrial Estate, Andheri West",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "serviceRadius": 15.0,
            "hourlyRate": 350.0,
            "verificationStatus": "VERIFIED",
            "rating": 4.9,
            "totalReviews": 12,
            "completedJobs": 45,
            "profileImage": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"
        },
        {
            "fullName": "Vikram Singh",
            "email": "provider.vikram@quickservice.com",
            "phone": "9876543211",
            "passwordHash": hash_password("ProviderPass123!"),
            "businessName": "CoolBreeze AC & Refrigerator Experts",
            "serviceCategories": ["AC Repair", "Refrigerator Repair", "Washing Machine Repair"],
            "description": "Fast, clean, and guaranteed cooling repairs for all major appliance brands. Emergency same-day service available.",
            "experience": 6,
            "address": "Shop 4, Market Road, Dadar",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400014",
            "serviceRadius": 12.0,
            "hourlyRate": 450.0,
            "verificationStatus": "VERIFIED",
            "rating": 4.8,
            "totalReviews": 8,
            "completedJobs": 28,
            "profileImage": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
        },
        {
            "fullName": "Sanjay Kumar",
            "email": "provider.sanjay@quickservice.com",
            "phone": "9876543212",
            "passwordHash": hash_password("ProviderPass123!"),
            "businessName": "ProPlumb Pipe & Leakage Solutions",
            "serviceCategories": ["Plumber"],
            "description": "Licensed plumber specializing in high-pressure leak detection, tap replacement, and bathroom drainage.",
            "experience": 10,
            "address": "12 Connaught Place",
            "city": "Delhi",
            "state": "Delhi",
            "pincode": "110001",
            "serviceRadius": 20.0,
            "hourlyRate": 300.0,
            "verificationStatus": "VERIFIED",
            "rating": 4.9,
            "totalReviews": 15,
            "completedJobs": 60,
            "profileImage": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
        }
    ]

    for pdata in provider_users_data:
        u_doc = {
            "fullName": pdata["fullName"],
            "email": pdata["email"].lower(),
            "phone": pdata["phone"],
            "passwordHash": pdata["passwordHash"],
            "role": "PROVIDER",
            "profileImage": pdata["profileImage"],
            "address": pdata["address"],
            "city": pdata["city"],
            "state": pdata["state"],
            "pincode": pdata["pincode"],
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        }
        u_res = await db.users.insert_one(u_doc)

        prov_doc = {
            "userId": u_res.inserted_id,
            "businessName": pdata["businessName"],
            "serviceCategories": pdata["serviceCategories"],
            "description": pdata["description"],
            "experience": pdata["experience"],
            "phone": pdata["phone"],
            "email": pdata["email"].lower(),
            "address": pdata["address"],
            "city": pdata["city"],
            "state": pdata["state"],
            "pincode": pdata["pincode"],
            "serviceRadius": pdata["serviceRadius"],
            "hourlyRate": pdata["hourlyRate"],
            "profileImage": pdata["profileImage"],
            "verificationStatus": pdata["verificationStatus"],
            "rating": pdata["rating"],
            "totalReviews": pdata["totalReviews"],
            "completedJobs": pdata["completedJobs"],
            "isAvailable": True,
            "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "workingHours": {"start": "09:00 AM", "end": "06:00 PM"},
            "createdAt": now,
            "updatedAt": now
        }
        await db.providers.insert_one(prov_doc)
        logger.info(f"Provider created: {pdata['email']} ({pdata['businessName']})")

    logger.info("==========================================================================")
    logger.info("SEED COMPLETED SUCCESSFULLY!")
    logger.info("Sample Logins (LOCAL DEV ONLY):")
    logger.info(f"  ADMIN:    {settings.ADMIN_EMAIL}  /  {settings.ADMIN_PASSWORD}")
    logger.info(f"  CUSTOMER: customer@quickservice.com  /  CustomerPass123!")
    logger.info(f"  PROVIDER: provider.rahul@quickservice.com  /  ProviderPass123!")
    logger.info("==========================================================================")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
