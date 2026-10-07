import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

async def normalize_provider_user_ids():
    """
    One-time migration script to ensure all userId fields in 'providers' collection
    are stored consistently as ObjectId references matching users._id.
    """
    mongodb_uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DB_NAME", "quickservice")

    client = AsyncIOMotorClient(mongodb_uri)
    db = client[db_name]

    providers = await db.providers.find({}).to_list(length=1000)
    updated_count = 0

    for p in providers:
        user_id = p.get("userId")
        if isinstance(user_id, str) and ObjectId.is_valid(user_id):
            oid = ObjectId(user_id)
            await db.providers.update_one({"_id": p["_id"]}, {"$set": {"userId": oid}})
            updated_count += 1

    print(f"Migration Complete: Normalized {updated_count} provider userId fields to ObjectId.")
    client.close()

if __name__ == "__main__":
    asyncio.run(normalize_provider_user_ids())
