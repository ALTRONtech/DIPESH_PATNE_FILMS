import os
import getpass
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import django
django.setup()
from django.contrib.auth.hashers import make_password

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
db_name = os.getenv("MONGODB_DB", "photography_business")
client = MongoClient(uri, serverSelectionTimeoutMS=4000)
client.admin.command("ping")
db = client[db_name]

username = input("Admin username: ").strip()
while not username:
    username = input("Username cannot be blank. Try again: ").strip()
password = getpass.getpass("Admin password (minimum 10 characters): ")
while len(password) < 10:
    print("Use at least 10 characters.")
    password = getpass.getpass("Admin password: ")

db.users.update_one(
    {"username": username},
    {"$set": {"username": username, "password_hash": make_password(password), "updated_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc)},
     "$setOnInsert": {"created_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc)}},
    upsert=True,
)
print("Admin account created/updated.")
client.close()
