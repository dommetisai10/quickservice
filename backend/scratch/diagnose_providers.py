import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

async def diagnose():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    db = client[os.getenv("DB_NAME", "quickservice")]

    providers = await db.providers.find({}).to_list(length=100)
    print(f"Total Providers Documents: {len(providers)}")

    for idx, p in enumerate(providers):
        user_id_val = p.get("userId")
        print(f"\n--- Provider #{idx+1} ---")
        print(f"Provider ID: {p.get('_id')} (type: {type(p.get('_id'))})")
        print(f"Business Name: {p.get('businessName')}")
        print(f"Verification Status: '{p.get('verificationStatus')}'")
        print(f"userId field value: {repr(user_id_val)} (type: {type(user_id_val)})")
        
        # Test lookup in users collection
        if user_id_val:
            # Query by string
            u_str = await db.users.find_one({"_id": str(user_id_val)})
            # Query by ObjectId if convertible
            u_oid = None
            if isinstance(user_id_val, str) and ObjectId.is_valid(user_id_val):
                u_oid = await db.users.find_one({"_id": ObjectId(user_id_val)})
            elif isinstance(user_id_val, ObjectId):
                u_oid = await db.users.find_one({"_id": user_id_val})

            print(f"Lookup by str(_id): {u_str.get('email') if u_str else 'NONE'}")
            print(f"Lookup by ObjectId(_id): {u_oid.get('email') if u_oid else 'NONE'}")

    client.close()

if __name__ == "__main__":
    asyncio.run(diagnose())
