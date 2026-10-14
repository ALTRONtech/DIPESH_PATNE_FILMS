import os
from datetime import datetime, timedelta, timezone
import jwt
from django.contrib.auth.hashers import check_password, make_password
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from .db import get_db

def create_token(user):
    minutes = int(os.getenv("JWT_EXP_MINUTES", "1440"))
    payload = {
        "sub": str(user["_id"]),
        "username": user["username"],
        "exp": datetime.now(timezone.utc) + timedelta(minutes=minutes),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, os.getenv("JWT_SECRET_KEY", os.getenv("DJANGO_SECRET_KEY", "development-only-change-me")), algorithm="HS256")

def verify_password(raw_password, stored_hash):
    return check_password(raw_password, stored_hash)

def hash_password(raw_password):
    return make_password(raw_password)

class MongoUser(dict):
    @property
    def is_authenticated(self):
        return True

class JWTAuthentication(BaseAuthentication):
    def authenticate_header(self, request):
        # Makes DRF answer 401 (with WWW-Authenticate: Bearer) instead of 403
        # when no token is supplied on protected endpoints.
        return "Bearer"

    def authenticate(self, request):
        header = get_authorization_header(request)
        if not header:
            return None
        try:
            parts = header.split()
            if len(parts) != 2 or parts[0].lower() != b"bearer":
                raise AuthenticationFailed("Use Authorization: Bearer <token>.")
            payload = jwt.decode(parts[1], os.getenv("JWT_SECRET_KEY", os.getenv("DJANGO_SECRET_KEY", "development-only-change-me")), algorithms=["HS256"])
            user = get_db().users.find_one({"username": payload["username"]})
            if not user:
                raise AuthenticationFailed("User not found.")
            return (MongoUser(user), None)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token expired. Please log in again.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token.")
