import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def check_db_contents():
    mongodb_uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DB_NAME", "quickservice")

    client = AsyncIOMotorClient(mongodb_uri)
    db = client[db_name]

    print("==========================================================================")
    print("                      QUICKSERVICE DATABASE INSPECTION                     ")
    print("==========================================================================")

    # 1. Users
    users_count = await db.users.count_documents({})
    print(f"\n[USERS] Total Documents: {users_count}")
    async for u in db.users.find({}, {"password_hash": 0}).limit(5):
        print(f"  - ID: {u.get('_id')} | Name: {u.get('name')} | Email: {u.get('email')} | Role: {u.get('role')} | Active: {u.get('is_active')}")

    # 2. Providers
    providers_count = await db.providers.count_documents({})
    print(f"\n[PROVIDERS] Total Documents: {providers_count}")
    async for p in db.providers.find({}).limit(5):
        print(f"  - ID: {p.get('_id')} | Business: {p.get('businessName')} | Status: {p.get('verificationStatus')} | Rating: {p.get('rating')} ({p.get('totalReviews')} reviews)")

    # 3. Services
    services_count = await db.services.count_documents({})
    print(f"\n[SERVICES] Total Documents: {services_count}")
    async for s in db.services.find({}).limit(5):
        print(f"  - ID: {s.get('_id')} | Name: {s.get('name')} | Category: {s.get('category')} | Price: Rs.{s.get('basePrice')}")

    # 4. Bookings
    bookings_count = await db.bookings.count_documents({})
    print(f"\n[BOOKINGS] Total Documents: {bookings_count}")
    async for b in db.bookings.find({}).limit(5):
        print(f"  - BookingID: {b.get('bookingId')} | Service: {b.get('serviceName')} | Date: {b.get('bookingDate')} | Slot: {b.get('timeSlot')} | Status: {b.get('status')}")

    # 5. Complaints & Reviews
    complaints_count = await db.complaints.count_documents({})
    reviews_count = await db.reviews.count_documents({})
    print(f"\n[COMPLAINTS] Total Documents: {complaints_count}")
    print(f"[REVIEWS]    Total Documents: {reviews_count}")

    print("==========================================================================")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_db_contents())
