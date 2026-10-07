import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from app.utils.auth_utils import create_access_token
from app.routes.admin_routes import get_providers_list

load_dotenv()

async def test_route():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    db = client[os.getenv("DB_NAME", "quickservice")]

    admin_user = await db.users.find_one({"role": "ADMIN"})
    print("Admin User:", admin_user.get("email") if admin_user else "NOT FOUND")

    # Direct call to get_providers_list function
    res = await get_providers_list(
        search=None,
        status_filter="ALL",
        city=None,
        service=None,
        page=1,
        limit=10,
        current_admin=admin_user,
        db=db
    )

    print("Result Keys:", list(res.keys()))
    print("Total Count:", res.get("total"))
    print("Providers Length:", len(res.get("providers", [])))
    for p in res.get("providers", []):
        print(f"  - Business: {p['businessName']} | Status: {p['verificationStatus']} | Owner: {p['providerName']} ({p['email']})")

    client.close()

if __name__ == "__main__":
    asyncio.run(test_route())
