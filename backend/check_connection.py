import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def check_db_connection():
    mongodb_uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DB_NAME", "quickservice")

    if not mongodb_uri:
        print("ERROR: MONGODB_URI environment variable is missing in .env")
        sys.exit(1)

    try:
        # Connect to MongoDB with 10s server selection timeout
        client = AsyncIOMotorClient(mongodb_uri, serverSelectionTimeoutMS=10000)
        # Send a ping command to verify connection
        await client.admin.command('ping')
        print("MongoDB connected successfully")
        client.close()
        sys.exit(0)
    except Exception as e:
        err_msg = str(e)
        # Mask password if present in error message
        if "@" in err_msg and "://" in err_msg:
            prefix = err_msg.split("://")[0] + "://"
            rest = err_msg.split("@")[1]
            err_msg = f"{prefix}****:****@{rest}"
        print(f"MongoDB connection failed: {err_msg}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(check_db_connection())
