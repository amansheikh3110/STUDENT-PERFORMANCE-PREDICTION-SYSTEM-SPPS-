"""MongoDB connection using Motor (async driver)."""

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URL, DATABASE_NAME

client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    """Create database connection."""
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    print(f"✅ Connected to MongoDB: {DATABASE_NAME}")


async def close_mongo_connection():
    """Close database connection."""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_database():
    """Return database instance."""
    return db
