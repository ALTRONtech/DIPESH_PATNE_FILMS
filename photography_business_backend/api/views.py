import os
from datetime import datetime, timezone
from bson import ObjectId
from pymongo.errors import PyMongoError
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .db import get_db
from .serializers import EnquirySerializer
from .auth import JWTAuthentication, create_token, verify_password

def serialize_doc(doc):
    if not doc:
        return doc
    result = dict(doc)
    if "_id" in result:
        result["id"] = str(result.pop("_id"))
    for key, value in list(result.items()):
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    try:
        db = get_db()
        db.command("ping")
        return Response({"status": "ok", "database": "connected"})
    except Exception:
        return Response({"status": "error", "database": "unavailable"}, status=503)

@api_view(["POST"])
@permission_classes([AllowAny])
def create_enquiry(request):
    serializer = EnquirySerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    record = {
        **serializer.validated_data,
        "status": "new",
        "created_at": datetime.now(timezone.utc),
        "source": "portfolio_website",
    }
    try:
        result = get_db().enquiries.insert_one(record)
        record["_id"] = result.inserted_id
        return Response({"message": "Enquiry saved successfully.", "enquiry": serialize_doc(record)}, status=status.HTTP_201_CREATED)
    except PyMongoError:
        return Response({"error": "Unable to save enquiry right now."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = str(request.data.get("username", "")).strip()
    password = str(request.data.get("password", ""))
    user = get_db().users.find_one({"username": username})
    if not user or not verify_password(password, user.get("password_hash", "")):
        return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({"token": create_token(user), "user": {"id": str(user["_id"]), "username": user["username"]}})

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({"id": str(request.user["_id"]), "username": request.user["username"]})

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def enquiries(request):
    db = get_db()
    items = [serialize_doc(x) for x in db.enquiries.find().sort("created_at", -1).limit(500)]
    return Response(items)

@api_view(["PATCH", "DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def enquiry_detail(request, enquiry_id):
    if not ObjectId.is_valid(enquiry_id):
        return Response({"error": "Invalid enquiry ID."}, status=400)
    db = get_db()
    oid = ObjectId(enquiry_id)
    if request.method == "DELETE":
        result = db.enquiries.delete_one({"_id": oid})
        return Response(status=204 if result.deleted_count else 404)
    new_status = request.data.get("status")
    allowed = {"new", "contacted", "confirmed", "closed"}
    if new_status not in allowed:
        return Response({"error": "Status must be new, contacted, confirmed, or closed."}, status=400)
    result = db.enquiries.update_one({"_id": oid}, {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}})
    if not result.matched_count:
        return Response({"error": "Enquiry not found."}, status=404)
    return Response(serialize_doc(db.enquiries.find_one({"_id": oid})))

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def dashboard(request):
    db = get_db()
    return Response({
        "total_enquiries": db.enquiries.count_documents({}),
        "new_enquiries": db.enquiries.count_documents({"status": "new"}),
        "contacted": db.enquiries.count_documents({"status": "contacted"}),
        "confirmed": db.enquiries.count_documents({"status": "confirmed"}),
    })
