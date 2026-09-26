import os
from functools import lru_cache
from pymongo import MongoClient

@lru_cache(maxsize=1)
def get_db():
    client = MongoClient(os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017"), serverSelectionTimeoutMS=4000)
    client.admin.command("ping")
    return client[os.getenv("MONGODB_DB", "photography_business")]
