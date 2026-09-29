import os, jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from django.http import JsonResponse
def token_for(user):
 now=datetime.now(timezone.utc)
 return jwt.encode({"sub":str(user["_id"]),"username":user["username"],"iat":now,"exp":now+timedelta(minutes=int(os.getenv("JWT_EXP_MINUTES","480")))}, os.getenv("JWT_SECRET_KEY","development-only-change-me"), algorithm="HS256")
def auth_required(fn):
 @wraps(fn)
 def wrapped(request,*args,**kwargs):
  h=request.headers.get("Authorization", "")
  if not h.startswith("Bearer "): return JsonResponse({"success":False,"error":"Missing Bearer token"},status=401)
  try: request.jwt=jwt.decode(h[7:],os.getenv("JWT_SECRET_KEY","development-only-change-me"),algorithms=["HS256"])
  except jwt.ExpiredSignatureError: return JsonResponse({"success":False,"error":"Token expired; log in again"},status=401)
  except jwt.InvalidTokenError: return JsonResponse({"success":False,"error":"Invalid token"},status=401)
  return fn(request,*args,**kwargs)
 return wrapped
