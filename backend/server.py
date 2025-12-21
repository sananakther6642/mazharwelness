from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query, Body
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import httpx
import random
import string

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from models import (
    User, UserCreate, UserLogin, UserRole, OTPRequest, OTPVerify,
    ClientProfile, ClientType, ParentProfileCreate, WomanProfileCreate,
    StaffProfile, StaffProfileCreate,
    Service, ServiceCategory, ServiceBase,
    Package, PackageBase, 
    GuestBooking, GuestBookingCreate, GuestBookingStatus, GuestBookingConvert,
    Appointment, AppointmentCreate, AppointmentStatus,
    Membership, MembershipCreate, 
    Invoice, InvoiceCreate, InvoiceItem, Payment, PaymentCreate, PaymentStatus, Receipt,
    Assessment, AssessmentCreate, AssessmentType,
    TreatmentPlan, TreatmentPlanCreate,
    DailyNote, DailyNoteCreate,
    Exercise, ExerciseCreate, ExerciseCategory, ExerciseAssignment, ExerciseAssignmentCreate,
    DietPlan, DietPlanCreate, DietPlanType,
    WorkoutPlan, WorkoutPlanCreate,
    ProgressMetric, ProgressMetricCreate, MetricType,
    AttendanceLog, Message, Conversation,
    Notification, NotificationType, NotificationTemplate,
    Consultation,
    Testimonial, FAQ, GalleryImage,
    AuditLog, AuditAction, SystemSettings
)
from auth import (
    hash_password, verify_password, create_jwt_token, decode_jwt_token,
    get_current_user, get_optional_user, require_roles, require_any_staff,
    Permissions, create_audit_log, soft_delete, exclude_deleted,
    lock_medical_record, check_record_editable, verify_client_access,
    get_assigned_clients
)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Mazhar Wellness & Paediatric Physio API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============ UTILITY FUNCTIONS ============

def serialize_datetime(obj):
    """Convert datetime objects to ISO strings"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


def prepare_for_db(data: dict) -> dict:
    """Prepare data for MongoDB insertion"""
    result = {}
    for key, value in data.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, dict):
            result[key] = prepare_for_db(value)
        elif isinstance(value, list):
            result[key] = [prepare_for_db(v) if isinstance(v, dict) else serialize_datetime(v) for v in value]
        else:
            result[key] = value
    return result


# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {"message": "Mazhar Wellness API", "status": "healthy"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(user_data: UserCreate, request: Request):
    """Register a new user"""
    existing = await db.users.find_one({"email": user_data.email, "deleted_at": None}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        role=user_data.role
    )
    user_dict = prepare_for_db(user.model_dump())
    user_dict["password_hash"] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    # Create audit log
    await create_audit_log(
        db, 
        {"user_id": user.user_id, "email": user.email, "role": user.role.value,
         "_request_ip": request.client.host if request.client else None},
        AuditAction.CREATE, "users", user.user_id,
        new_value={"email": user.email, "role": user.role.value}
    )
    
    token = create_jwt_token(user.user_id, user.email, user.role.value)
    
    return {
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role.value
        },
        "token": token
    }


@api_router.post("/auth/login")
async def login(credentials: UserLogin, request: Request, response: Response):
    """Login with email and password"""
    user = await db.users.find_one(
        {"email": credentials.email, "deleted_at": None}, 
        {"_id": 0}
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is disabled")
    
    token = create_jwt_token(user["user_id"], user["email"], user["role"])
    
    # Create audit log
    await create_audit_log(
        db,
        {"user_id": user["user_id"], "email": user["email"], "role": user["role"],
         "_request_ip": request.client.host if request.client else None},
        AuditAction.LOGIN, "users", user["user_id"]
    )
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "phone": user.get("phone"),
            "picture": user.get("picture")
        },
        "token": token
    }


@api_router.post("/auth/login/otp/send")
async def send_otp(otp_request: OTPRequest):
    """Send OTP for phone login"""
    # Check if phone exists
    user = await db.users.find_one(
        {"phone": otp_request.phone, "deleted_at": None},
        {"_id": 0}
    )
    if not user:
        raise HTTPException(status_code=404, detail="Phone number not registered")
    
    # Generate OTP
    otp = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    # Store OTP
    await db.otp_codes.insert_one({
        "phone": otp_request.phone,
        "otp": otp,
        "expires_at": expires_at.isoformat(),
        "used": False
    })
    
    # TODO: Send OTP via Twilio SMS
    logger.info(f"OTP for {otp_request.phone}: {otp}")  # For dev only
    
    return {"message": "OTP sent successfully", "expires_in": 300}


@api_router.post("/auth/login/otp/verify")
async def verify_otp(otp_verify: OTPVerify, request: Request, response: Response):
    """Verify OTP and login"""
    # Find OTP
    otp_record = await db.otp_codes.find_one({
        "phone": otp_verify.phone,
        "otp": otp_verify.otp,
        "used": False
    })
    
    if not otp_record:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    
    # Check expiry
    expires_at = datetime.fromisoformat(otp_record["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=401, detail="OTP expired")
    
    # Mark OTP as used
    await db.otp_codes.update_one(
        {"_id": otp_record["_id"]},
        {"$set": {"used": True}}
    )
    
    # Get user
    user = await db.users.find_one(
        {"phone": otp_verify.phone, "deleted_at": None},
        {"_id": 0}
    )
    
    token = create_jwt_token(user["user_id"], user["email"], user["role"])
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        },
        "token": token
    }


@api_router.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    """Process Google OAuth session from Emergent Auth"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    async with httpx.AsyncClient() as http_client:
        try:
            auth_response = await http_client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = auth_response.json()
        except Exception as e:
            logger.error(f"Error calling Emergent Auth: {e}")
            raise HTTPException(status_code=500, detail="Authentication service error")
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    
    existing_user = await db.users.find_one({"email": email, "deleted_at": None}, {"_id": 0})
    
    if existing_user:
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        user_id = existing_user["user_id"]
        role = existing_user["role"]
    else:
        user = User(
            email=email,
            name=name,
            picture=picture,
            role=UserRole.CLIENT
        )
        user_dict = prepare_for_db(user.model_dump())
        await db.users.insert_one(user_dict)
        user_id = user.user_id
        role = UserRole.CLIENT.value
    
    token = create_jwt_token(user_id, email, role)
    
    # Audit log
    await create_audit_log(
        db,
        {"user_id": user_id, "email": email, "role": role,
         "_request_ip": request.client.host if request.client else None},
        AuditAction.LOGIN, "users", user_id,
        new_value={"method": "google_oauth"}
    )
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {
        "user": {
            "user_id": user_id,
            "email": email,
            "name": name,
            "role": role,
            "picture": picture
        },
        "token": token
    }


@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user"""
    user = await db.users.find_one(
        {"user_id": current_user["user_id"], "deleted_at": None}, 
        {"_id": 0, "password_hash": 0}
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, current_user: dict = Depends(get_optional_user)):
    """Logout user"""
    if current_user:
        await create_audit_log(
            db, current_user, AuditAction.LOGOUT, "users", current_user["user_id"]
        )
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}


# ============ CLIENT REGISTRATION & PROFILES ============

@api_router.post("/clients/register/parent")
async def register_parent(profile: ParentProfileCreate, current_user: dict = Depends(get_current_user)):
    """Register parent client profile"""
    existing = await db.client_profiles.find_one({"user_id": current_user["user_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    client_profile = ClientProfile(
        user_id=current_user["user_id"],
        client_type=ClientType.PARENT,
        child_name=profile.child_name,
        child_age=profile.child_age,
        child_condition=profile.child_condition,
        child_dob=profile.child_dob,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        goal=profile.goal,
        medical_conditions=profile.medical_conditions,
        emergency_contact=profile.emergency_contact,
        emergency_phone=profile.emergency_phone
    )
    
    profile_dict = prepare_for_db(client_profile.model_dump())
    await db.client_profiles.insert_one(profile_dict)
    
    return {"profile_id": client_profile.profile_id, "message": "Parent profile created"}


@api_router.post("/clients/register/woman")
async def register_woman(profile: WomanProfileCreate, current_user: dict = Depends(get_current_user)):
    """Register woman client profile"""
    existing = await db.client_profiles.find_one({"user_id": current_user["user_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    client_profile = ClientProfile(
        user_id=current_user["user_id"],
        client_type=ClientType.WOMAN,
        age=profile.age,
        pcod_tracking=profile.pcod_tracking,
        cycle_tracking_consent=profile.cycle_tracking_consent,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        goal=profile.goal,
        preferred_batch=profile.preferred_batch,
        medical_conditions=profile.medical_conditions,
        emergency_contact=profile.emergency_contact,
        emergency_phone=profile.emergency_phone
    )
    
    profile_dict = prepare_for_db(client_profile.model_dump())
    await db.client_profiles.insert_one(profile_dict)
    
    return {"profile_id": client_profile.profile_id, "message": "Woman profile created"}


@api_router.get("/clients/profile")
async def get_client_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's client profile"""
    profile = await db.client_profiles.find_one(
        {"user_id": current_user["user_id"]}, 
        {"_id": 0}
    )
    return profile


@api_router.get("/clients")
async def get_clients(
    search: Optional[str] = None,
    client_type: Optional[str] = None,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Get all clients (Admin/Reception only)"""
    query = exclude_deleted({"role": UserRole.CLIENT.value})
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    
    clients = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(500)
    
    # Enrich with profiles
    for client in clients:
        profile = await db.client_profiles.find_one(
            {"user_id": client["user_id"]},
            {"_id": 0}
        )
        client["profile"] = profile
        
        if client_type and profile and profile.get("client_type") != client_type:
            clients.remove(client)
    
    return clients


@api_router.get("/clients/{client_id}")
async def get_client_detail(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get client details with profile"""
    await verify_client_access(db, current_user, client_id)
    
    user = await db.users.find_one(
        {"user_id": client_id, "deleted_at": None},
        {"_id": 0, "password_hash": 0}
    )
    if not user:
        raise HTTPException(status_code=404, detail="Client not found")
    
    profile = await db.client_profiles.find_one(
        {"user_id": client_id},
        {"_id": 0}
    )
    
    user["profile"] = profile
    return user


@api_router.put("/clients/{client_id}/assign-staff")
async def assign_staff_to_client(
    client_id: str,
    staff_id: str = Query(...),
    staff_role: str = Query(...),  # physio, trainer, nutritionist
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Assign staff to client"""
    field_map = {
        "physio": "assigned_physio",
        "physiotherapist": "assigned_physio",
        "trainer": "assigned_trainer",
        "nutritionist": "assigned_nutritionist"
    }
    
    field = field_map.get(staff_role.lower())
    if not field:
        raise HTTPException(status_code=400, detail="Invalid staff role")
    
    # Verify staff exists and has correct role
    staff = await db.users.find_one(
        {"user_id": staff_id, "deleted_at": None},
        {"_id": 0}
    )
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    result = await db.client_profiles.update_one(
        {"user_id": client_id},
        {"$set": {field: staff_id, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client profile not found")
    
    await create_audit_log(
        db, current_user, AuditAction.UPDATE, "client_profiles", client_id,
        new_value={field: staff_id}
    )
    
    return {"message": f"Staff assigned successfully"}


# ============ STAFF-SPECIFIC CLIENT ENDPOINTS ============

@api_router.get("/physio/my-clients")
async def get_physio_clients(
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.PHYSIOTHERAPIST))
):
    """Get clients assigned to the physiotherapist"""
    role = current_user["role"]
    user_id = current_user["user_id"]
    
    if role == UserRole.ADMIN.value:
        # Admin can see all clients
        clients = await db.users.find(
            exclude_deleted({"role": UserRole.CLIENT.value}),
            {"_id": 0, "password_hash": 0}
        ).to_list(500)
    else:
        # Get assigned clients
        profiles = await db.client_profiles.find(
            {"assigned_physio": user_id},
            {"_id": 0, "user_id": 1}
        ).to_list(500)
        client_ids = [p["user_id"] for p in profiles]
        
        if not client_ids:
            return []
        
        clients = await db.users.find(
            {"user_id": {"$in": client_ids}, "deleted_at": None},
            {"_id": 0, "password_hash": 0}
        ).to_list(500)
    
    # Enrich with profiles
    for client in clients:
        profile = await db.client_profiles.find_one(
            {"user_id": client["user_id"]},
            {"_id": 0}
        )
        client["profile"] = profile
    
    return clients


@api_router.get("/trainer/my-clients")
async def get_trainer_clients(
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.TRAINER))
):
    """Get clients assigned to the trainer"""
    role = current_user["role"]
    user_id = current_user["user_id"]
    
    if role == UserRole.ADMIN.value:
        clients = await db.users.find(
            exclude_deleted({"role": UserRole.CLIENT.value}),
            {"_id": 0, "password_hash": 0}
        ).to_list(500)
    else:
        profiles = await db.client_profiles.find(
            {"assigned_trainer": user_id},
            {"_id": 0, "user_id": 1}
        ).to_list(500)
        client_ids = [p["user_id"] for p in profiles]
        
        if not client_ids:
            return []
        
        clients = await db.users.find(
            {"user_id": {"$in": client_ids}, "deleted_at": None},
            {"_id": 0, "password_hash": 0}
        ).to_list(500)
    
    for client in clients:
        profile = await db.client_profiles.find_one(
            {"user_id": client["user_id"]},
            {"_id": 0}
        )
        client["profile"] = profile
    
    return clients


@api_router.get("/nutritionist/my-clients")
async def get_nutritionist_clients(
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.NUTRITIONIST))
):
    """Get clients assigned to the nutritionist"""
    role = current_user["role"]
    user_id = current_user["user_id"]
    
    if role == UserRole.ADMIN.value:
        clients = await db.users.find(
            exclude_deleted({"role": UserRole.CLIENT.value}),
            {"_id": 0, "password_hash": 0}
        ).to_list(500)
    else:
        profiles = await db.client_profiles.find(
            {"assigned_nutritionist": user_id},
            {"_id": 0, "user_id": 1}
        ).to_list(500)
        client_ids = [p["user_id"] for p in profiles]
        
        if not client_ids:
            return []
        
        clients = await db.users.find(
            {"user_id": {"$in": client_ids}, "deleted_at": None},
            {"_id": 0, "password_hash": 0}
        ).to_list(500)
    
    for client in clients:
        profile = await db.client_profiles.find_one(
            {"user_id": client["user_id"]},
            {"_id": 0}
        )
        client["profile"] = profile
    
    return clients


# ============ GUEST BOOKING ============

@api_router.post("/guest/booking")
async def create_guest_booking(booking: GuestBookingCreate, request: Request):
    """Create a guest booking (no auth required)"""
    guest_booking = GuestBooking(**booking.model_dump())
    booking_dict = prepare_for_db(guest_booking.model_dump())
    
    await db.guest_bookings.insert_one(booking_dict)
    
    # Create notification for reception/admin
    notification = Notification(
        user_id="admin_broadcast",
        title="New Guest Booking",
        message=f"New booking from {booking.full_name} for {booking.service_category.value}",
        notification_type=NotificationType.APPOINTMENT
    )
    await db.notifications.insert_one(prepare_for_db(notification.model_dump()))
    
    return {
        "booking_id": guest_booking.booking_id,
        "message": "Thank you! Your booking request has been received. Our team will contact you shortly."
    }


@api_router.get("/guest/bookings")
async def get_guest_bookings(
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Get all guest bookings"""
    query = exclude_deleted()
    if status:
        query["status"] = status
    if date_from:
        query["preferred_date"] = {"$gte": date_from}
    if date_to:
        query.setdefault("preferred_date", {})["$lte"] = date_to
    
    bookings = await db.guest_bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bookings


@api_router.put("/guest/bookings/{booking_id}/status")
async def update_guest_booking_status(
    booking_id: str,
    status: GuestBookingStatus,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Update guest booking status"""
    booking = await db.guest_bookings.find_one({"booking_id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    update_data = {
        "status": status.value,
        "assigned_to": current_user["user_id"]
    }
    if notes:
        update_data["notes"] = notes
    
    await db.guest_bookings.update_one(
        {"booking_id": booking_id},
        {"$set": update_data}
    )
    
    await create_audit_log(
        db, current_user, AuditAction.UPDATE, "guest_bookings", booking_id,
        old_value={"status": booking.get("status")},
        new_value={"status": status.value}
    )
    
    return {"message": "Booking updated"}


@api_router.post("/guest/bookings/{booking_id}/convert")
async def convert_guest_to_client(
    booking_id: str,
    conversion_data: GuestBookingConvert,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Convert guest booking to registered client"""
    # Get booking
    booking = await db.guest_bookings.find_one(
        {"booking_id": booking_id, "deleted_at": None},
        {"_id": 0}
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.get("status") == GuestBookingStatus.CONVERTED.value:
        raise HTTPException(status_code=400, detail="Booking already converted")
    
    # Check if email exists
    existing = await db.users.find_one({"email": conversion_data.email, "deleted_at": None})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=conversion_data.email,
        name=booking["full_name"],
        phone=booking["phone"],
        role=UserRole.CLIENT
    )
    user_dict = prepare_for_db(user.model_dump())
    
    if conversion_data.password:
        user_dict["password_hash"] = hash_password(conversion_data.password)
    
    await db.users.insert_one(user_dict)
    
    # Create profile
    profile_data = {
        "user_id": user.user_id,
        "client_type": conversion_data.client_type.value,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if conversion_data.client_type == ClientType.PARENT:
        profile_data["child_name"] = conversion_data.child_name
        profile_data["child_age"] = conversion_data.child_age
    else:
        profile_data["age"] = conversion_data.age
    
    if conversion_data.assign_staff_id:
        # Determine staff role
        staff = await db.users.find_one({"user_id": conversion_data.assign_staff_id}, {"_id": 0})
        if staff:
            role_field_map = {
                UserRole.PHYSIOTHERAPIST.value: "assigned_physio",
                UserRole.TRAINER.value: "assigned_trainer",
                UserRole.NUTRITIONIST.value: "assigned_nutritionist"
            }
            field = role_field_map.get(staff["role"])
            if field:
                profile_data[field] = conversion_data.assign_staff_id
    
    profile = ClientProfile(**profile_data)
    await db.client_profiles.insert_one(prepare_for_db(profile.model_dump()))
    
    # Update booking status
    await db.guest_bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {
            "status": GuestBookingStatus.CONVERTED.value,
            "converted_to_user_id": user.user_id,
            "converted_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    result = {
        "user_id": user.user_id,
        "profile_id": profile.profile_id,
        "message": "Client created successfully"
    }
    
    # Create appointment if requested
    if conversion_data.schedule_appointment:
        apt_data = conversion_data.schedule_appointment
        appointment = Appointment(
            client_id=user.user_id,
            service_id=apt_data.get("service_id"),
            staff_id=apt_data.get("staff_id", conversion_data.assign_staff_id),
            scheduled_date=apt_data.get("scheduled_date"),
            scheduled_time=apt_data.get("scheduled_time"),
            created_by=current_user["user_id"]
        )
        await db.appointments.insert_one(prepare_for_db(appointment.model_dump()))
        result["appointment_id"] = appointment.appointment_id
    
    await create_audit_log(
        db, current_user, AuditAction.CREATE, "users", user.user_id,
        new_value={"converted_from_booking": booking_id}
    )
    
    return result


# ============ SERVICES ============

@api_router.get("/services")
async def get_services(category: Optional[str] = None):
    """Get all active services (public)"""
    query = exclude_deleted({"is_active": True})
    if category:
        query["category"] = category
    
    services = await db.services.find(query, {"_id": 0}).to_list(100)
    return services


@api_router.post("/services")
async def create_service(
    service_data: ServiceBase,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Create a new service (Admin only)"""
    service = Service(**service_data.model_dump(), created_by=current_user["user_id"])
    await db.services.insert_one(prepare_for_db(service.model_dump()))
    
    await create_audit_log(
        db, current_user, AuditAction.CREATE, "services", service.service_id,
        new_value={"name": service.name, "price": service.price}
    )
    
    return {"service_id": service.service_id, "message": "Service created"}


@api_router.put("/services/{service_id}")
async def update_service(
    service_id: str,
    service_data: ServiceBase,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Update a service (Admin only)"""
    existing = await db.services.find_one({"service_id": service_id, "deleted_at": None}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Check if price changed (audit important)
    if existing.get("price") != service_data.price:
        await create_audit_log(
            db, current_user, AuditAction.UPDATE, "services", service_id,
            old_value={"price": existing.get("price")},
            new_value={"price": service_data.price}
        )
    
    await db.services.update_one(
        {"service_id": service_id},
        {"$set": service_data.model_dump()}
    )
    
    return {"message": "Service updated"}


@api_router.delete("/services/{service_id}")
async def delete_service(
    service_id: str,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Soft delete a service (Admin only)"""
    await soft_delete(db, "services", "service_id", service_id, current_user)
    return {"message": "Service deleted"}


# ============ PACKAGES ============

@api_router.get("/packages")
async def get_packages():
    """Get all active packages (public)"""
    packages = await db.packages.find(
        exclude_deleted({"is_active": True}), 
        {"_id": 0}
    ).to_list(100)
    return packages


@api_router.post("/packages")
async def create_package(
    package_data: PackageBase,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Create a new package (Admin only)"""
    package = Package(**package_data.model_dump(), created_by=current_user["user_id"])
    await db.packages.insert_one(prepare_for_db(package.model_dump()))
    
    await create_audit_log(
        db, current_user, AuditAction.CREATE, "packages", package.package_id,
        new_value={"name": package.name, "price": package.price}
    )
    
    return {"package_id": package.package_id, "message": "Package created"}


@api_router.delete("/packages/{package_id}")
async def delete_package(
    package_id: str,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Soft delete a package (Admin only)"""
    await soft_delete(db, "packages", "package_id", package_id, current_user)
    return {"message": "Package deleted"}


# ============ APPOINTMENTS ============

@api_router.post("/appointments")
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new appointment"""
    # Client can only book for themselves
    if current_user["role"] == UserRole.CLIENT.value:
        appointment_data.client_id = current_user["user_id"]
    
    appointment = Appointment(
        **appointment_data.model_dump(),
        created_by=current_user["user_id"]
    )
    await db.appointments.insert_one(prepare_for_db(appointment.model_dump()))
    
    # Create notification for client
    notification = Notification(
        user_id=appointment_data.client_id,
        title="Appointment Scheduled",
        message=f"Your appointment on {appointment_data.scheduled_date} at {appointment_data.scheduled_time} has been scheduled.",
        notification_type=NotificationType.APPOINTMENT,
        action_url=f"/dashboard/appointments/{appointment.appointment_id}"
    )
    await db.notifications.insert_one(prepare_for_db(notification.model_dump()))
    
    return {"appointment_id": appointment.appointment_id, "message": "Appointment created"}


@api_router.get("/appointments")
async def get_appointments(
    client_id: Optional[str] = None,
    staff_id: Optional[str] = None,
    status: Optional[str] = None,
    date: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get appointments based on role"""
    query = exclude_deleted()
    
    role = current_user["role"]
    user_id = current_user["user_id"]
    
    # Role-based filtering
    if role == UserRole.CLIENT.value:
        query["client_id"] = user_id
    elif role in [UserRole.PHYSIOTHERAPIST.value, UserRole.TRAINER.value, UserRole.NUTRITIONIST.value]:
        query["staff_id"] = user_id
    # Admin and Reception can see all
    
    # Additional filters
    if client_id and role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]:
        query["client_id"] = client_id
    if staff_id:
        query["staff_id"] = staff_id
    if status:
        query["status"] = status
    if date:
        query["scheduled_date"] = date
    if date_from:
        query.setdefault("scheduled_date", {})
        query["scheduled_date"]["$gte"] = date_from
    if date_to:
        query.setdefault("scheduled_date", {})
        query["scheduled_date"]["$lte"] = date_to
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("scheduled_date", -1).to_list(1000)
    
    # Enrich with client and staff info
    for apt in appointments:
        client = await db.users.find_one({"user_id": apt["client_id"]}, {"_id": 0, "name": 1, "phone": 1})
        apt["client_name"] = client.get("name") if client else "Unknown"
        apt["client_phone"] = client.get("phone") if client else None
        
        staff = await db.users.find_one({"user_id": apt["staff_id"]}, {"_id": 0, "name": 1})
        apt["staff_name"] = staff.get("name") if staff else "Unknown"
        
        service = await db.services.find_one({"service_id": apt["service_id"]}, {"_id": 0, "name": 1})
        apt["service_name"] = service.get("name") if service else "Unknown"
    
    return appointments


@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status: AppointmentStatus,
    current_user: dict = Depends(get_current_user)
):
    """Update appointment status"""
    appointment = await db.appointments.find_one(
        {"appointment_id": appointment_id, "deleted_at": None}, 
        {"_id": 0}
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    role = current_user["role"]
    user_id = current_user["user_id"]
    
    can_update = (
        role in [UserRole.ADMIN.value, UserRole.RECEPTION.value] or
        appointment["staff_id"] == user_id or
        (appointment["client_id"] == user_id and status == AppointmentStatus.CANCELLED)
    )
    
    if not can_update:
        raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
    
    old_status = appointment.get("status")
    
    await db.appointments.update_one(
        {"appointment_id": appointment_id},
        {"$set": {"status": status.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await create_audit_log(
        db, current_user, AuditAction.UPDATE, "appointments", appointment_id,
        old_value={"status": old_status},
        new_value={"status": status.value}
    )
    
    return {"message": "Appointment status updated"}


@api_router.put("/appointments/{appointment_id}")
async def update_appointment(
    appointment_id: str,
    scheduled_date: Optional[str] = None,
    scheduled_time: Optional[str] = None,
    meeting_link: Optional[str] = None,
    notes: Optional[str] = None,
    is_online: Optional[bool] = None,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Update appointment details"""
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if scheduled_date:
        update_data["scheduled_date"] = scheduled_date
    if scheduled_time:
        update_data["scheduled_time"] = scheduled_time
    if meeting_link is not None:
        update_data["meeting_link"] = meeting_link
    if notes is not None:
        update_data["notes"] = notes
    if is_online is not None:
        update_data["is_online"] = is_online
    
    result = await db.appointments.update_one(
        {"appointment_id": appointment_id, "deleted_at": None},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"message": "Appointment updated"}


@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(
    appointment_id: str,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Soft delete appointment (Admin only)"""
    await soft_delete(db, "appointments", "appointment_id", appointment_id, current_user)
    return {"message": "Appointment deleted"}


# ============ STAFF MANAGEMENT ============

@api_router.get("/staff")
async def get_staff(
    role: Optional[str] = None,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Get all staff members"""
    query = exclude_deleted({"role": {"$ne": UserRole.CLIENT.value}})
    if role:
        query["role"] = role
    
    staff = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(100)
    
    # Enrich with staff profiles
    for s in staff:
        profile = await db.staff_profiles.find_one({"user_id": s["user_id"]}, {"_id": 0})
        s["staff_profile"] = profile
    
    return staff


@api_router.get("/staff/available")
async def get_available_staff(
    service_category: Optional[str] = None,
    role: Optional[str] = None
):
    """Get available staff for booking (public)"""
    query = exclude_deleted({
        "role": {"$in": [
            UserRole.PHYSIOTHERAPIST.value,
            UserRole.TRAINER.value,
            UserRole.NUTRITIONIST.value
        ]},
        "is_active": True
    })
    
    if role:
        query["role"] = role
    
    staff = await db.users.find(query, {"_id": 0, "password_hash": 0, "email": 0}).to_list(100)
    
    for s in staff:
        profile = await db.staff_profiles.find_one({"user_id": s["user_id"]}, {"_id": 0})
        s["profile"] = profile
    
    return staff


@api_router.post("/staff")
async def create_staff(
    user_data: UserCreate,
    profile_data: Optional[StaffProfileCreate] = None,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Create a new staff member (Admin only)"""
    if user_data.role == UserRole.CLIENT:
        raise HTTPException(status_code=400, detail="Use client registration for clients")
    
    existing = await db.users.find_one({"email": user_data.email, "deleted_at": None})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        role=user_data.role
    )
    user_dict = prepare_for_db(user.model_dump())
    user_dict["password_hash"] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    # Create staff profile if provided
    if profile_data:
        staff_profile = StaffProfile(
            user_id=user.user_id,
            **profile_data.model_dump()
        )
        await db.staff_profiles.insert_one(prepare_for_db(staff_profile.model_dump()))
    
    await create_audit_log(
        db, current_user, AuditAction.CREATE, "users", user.user_id,
        new_value={"role": user.role.value, "email": user.email}
    )
    
    return {"user_id": user.user_id, "message": f"Staff member created with role: {user.role.value}"}


@api_router.put("/staff/{user_id}")
async def update_staff(
    user_id: str,
    name: Optional[str] = None,
    phone: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Update staff member (Admin only)"""
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if name:
        update_data["name"] = name
    if phone:
        update_data["phone"] = phone
    if is_active is not None:
        update_data["is_active"] = is_active
    
    result = await db.users.update_one(
        {"user_id": user_id, "deleted_at": None},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    return {"message": "Staff updated"}


@api_router.delete("/staff/{user_id}")
async def delete_staff(
    user_id: str,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Soft delete staff member (Admin only)"""
    await soft_delete(db, "users", "user_id", user_id, current_user)
    return {"message": "Staff deleted"}


# ============ EXERCISE LIBRARY ============

@api_router.get("/exercises")
async def get_exercises(
    category: Optional[str] = None,
    search: Optional[str] = None,
    pcod_safe: Optional[bool] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get exercises from library"""
    role = current_user["role"]
    
    # Reception cannot access
    if role == UserRole.RECEPTION.value:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = exclude_deleted({"is_active": True})
    
    # Clients can only see assigned exercises
    if role == UserRole.CLIENT.value:
        assignments = await db.exercise_assignments.find(
            {"client_id": current_user["user_id"], "is_active": True},
            {"_id": 0, "exercise_id": 1}
        ).to_list(100)
        exercise_ids = [a["exercise_id"] for a in assignments]
        query["exercise_id"] = {"$in": exercise_ids}
    
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if pcod_safe is not None:
        query["pcod_safe"] = pcod_safe
    if min_age is not None:
        query["min_age"] = {"$lte": min_age}
    if max_age is not None:
        query["max_age"] = {"$gte": max_age}
    
    exercises = await db.exercises.find(query, {"_id": 0}).to_list(200)
    return exercises


@api_router.post("/exercises")
async def create_exercise(
    exercise_data: ExerciseCreate,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.PHYSIOTHERAPIST, UserRole.TRAINER))
):
    """Create a new exercise"""
    exercise = Exercise(
        **exercise_data.model_dump(),
        created_by=current_user["user_id"]
    )
    await db.exercises.insert_one(prepare_for_db(exercise.model_dump()))
    
    return {"exercise_id": exercise.exercise_id, "message": "Exercise created"}


@api_router.put("/exercises/{exercise_id}")
async def update_exercise(
    exercise_id: str,
    exercise_data: ExerciseCreate,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.PHYSIOTHERAPIST, UserRole.TRAINER))
):
    """Update an exercise"""
    result = await db.exercises.update_one(
        {"exercise_id": exercise_id, "deleted_at": None},
        {"$set": exercise_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    return {"message": "Exercise updated"}


@api_router.delete("/exercises/{exercise_id}")
async def delete_exercise(
    exercise_id: str,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Soft delete exercise (Admin only)"""
    await soft_delete(db, "exercises", "exercise_id", exercise_id, current_user)
    return {"message": "Exercise deleted"}


@api_router.post("/exercises/{exercise_id}/assign")
async def assign_exercise(
    exercise_id: str,
    assignment_data: ExerciseAssignmentCreate,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.PHYSIOTHERAPIST, UserRole.TRAINER))
):
    """Assign exercise to client"""
    # Verify exercise exists
    exercise = await db.exercises.find_one({"exercise_id": exercise_id, "deleted_at": None})
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    # Verify client access
    await verify_client_access(db, current_user, assignment_data.client_id)
    
    assignment = ExerciseAssignment(
        client_id=assignment_data.client_id,
        exercise_id=exercise_id,
        assigned_by=current_user["user_id"],
        sets=assignment_data.sets,
        reps=assignment_data.reps,
        frequency=assignment_data.frequency,
        notes=assignment_data.notes
    )
    await db.exercise_assignments.insert_one(prepare_for_db(assignment.model_dump()))
    
    return {"assignment_id": assignment.assignment_id, "message": "Exercise assigned"}


@api_router.get("/exercises/assigned/{client_id}")
async def get_assigned_exercises(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get exercises assigned to a client"""
    await verify_client_access(db, current_user, client_id)
    
    assignments = await db.exercise_assignments.find(
        {"client_id": client_id, "is_active": True},
        {"_id": 0}
    ).to_list(100)
    
    # Enrich with exercise details
    for a in assignments:
        exercise = await db.exercises.find_one(
            {"exercise_id": a["exercise_id"]},
            {"_id": 0}
        )
        a["exercise"] = exercise
    
    return assignments


# ============ ASSESSMENTS ============

@api_router.post("/assessments")
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: dict = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN))
):
    """Create an assessment"""
    await verify_client_access(db, current_user, assessment_data.client_id)
    
    assessment = Assessment(
        **assessment_data.model_dump(),
        staff_id=current_user["user_id"]
    )
    await db.assessments.insert_one(prepare_for_db(assessment.model_dump()))
    
    await create_audit_log(
        db, current_user, AuditAction.CREATE, "assessments", assessment.assessment_id,
        new_value={"client_id": assessment_data.client_id, "type": assessment_data.assessment_type.value}
    )
    
    return {"assessment_id": assessment.assessment_id, "message": "Assessment created"}


@api_router.get("/assessments/{client_id}")
async def get_client_assessments(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get assessments for a client"""
    role = current_user["role"]
    
    # Only physio, admin, and the client themselves can view
    if role == UserRole.CLIENT.value and current_user["user_id"] != client_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if role not in [UserRole.ADMIN.value, UserRole.PHYSIOTHERAPIST.value, UserRole.CLIENT.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    assessments = await db.assessments.find(
        exclude_deleted({"client_id": client_id}), 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return assessments


@api_router.put("/assessments/{assessment_id}")
async def update_assessment(
    assessment_id: str,
    findings: Optional[Dict[str, Any]] = Body(None),
    recommendations: Optional[str] = Body(None),
    current_user: dict = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN))
):
    """Update assessment (if not locked and same day)"""
    assessment = await db.assessments.find_one(
        {"assessment_id": assessment_id, "deleted_at": None},
        {"_id": 0}
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Check if author or admin
    if current_user["role"] != UserRole.ADMIN.value and assessment["staff_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Only the author can edit this assessment")
    
    check_record_editable(assessment, current_user, allow_same_day=True)
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if findings:
        update_data["findings"] = findings
    if recommendations:
        update_data["recommendations"] = recommendations
    
    await db.assessments.update_one(
        {"assessment_id": assessment_id},
        {"$set": update_data}
    )
    
    return {"message": "Assessment updated"}


@api_router.put("/assessments/{assessment_id}/lock")
async def lock_assessment(
    assessment_id: str,
    current_user: dict = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN))
):
    """Lock assessment to make it immutable"""
    await lock_medical_record(db, "assessments", "assessment_id", assessment_id, current_user)
    return {"message": "Assessment locked"}


# ============ TREATMENT PLANS ============

@api_router.post("/treatment-plans")
async def create_treatment_plan(
    plan_data: TreatmentPlanCreate,
    current_user: dict = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN))
):
    """Create a treatment plan"""
    await verify_client_access(db, current_user, plan_data.client_id)
    
    plan = TreatmentPlan(
        **plan_data.model_dump(),
        staff_id=current_user["user_id"],
        start_date=datetime.now(timezone.utc).strftime("%Y-%m-%d")
    )
    await db.treatment_plans.insert_one(prepare_for_db(plan.model_dump()))
    
    await create_audit_log(
        db, current_user, AuditAction.CREATE, "treatment_plans", plan.plan_id,
        new_value={"client_id": plan_data.client_id, "diagnosis": plan_data.diagnosis}
    )
    
    return {"plan_id": plan.plan_id, "message": "Treatment plan created"}


@api_router.get("/treatment-plans/{client_id}")
async def get_treatment_plans(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get treatment plans for a client"""
    role = current_user["role"]
    
    if role == UserRole.CLIENT.value and current_user["user_id"] != client_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if role not in [UserRole.ADMIN.value, UserRole.PHYSIOTHERAPIST.value, UserRole.CLIENT.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    plans = await db.treatment_plans.find(
        exclude_deleted({"client_id": client_id}), 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return plans


# ============ DAILY NOTES (SOAP) ============

@api_router.post("/daily-notes")
async def create_daily_note(
    note_data: DailyNoteCreate,
    current_user: dict = Depends(require_roles(UserRole.PHYSIOTHERAPIST))
):
    """Create a daily SOAP note (Physio only)"""
    await verify_client_access(db, current_user, note_data.client_id)
    
    note = DailyNote(
        **note_data.model_dump(),
        staff_id=current_user["user_id"]
    )
    await db.daily_notes.insert_one(prepare_for_db(note.model_dump()))
    
    await create_audit_log(
        db, current_user, AuditAction.CREATE, "daily_notes", note.note_id,
        new_value={"client_id": note_data.client_id, "appointment_id": note_data.appointment_id}
    )
    
    return {"note_id": note.note_id, "message": "Daily note created"}


@api_router.get("/daily-notes/{client_id}")
async def get_daily_notes(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get daily notes for a client"""
    role = current_user["role"]
    
    # Client gets summary only
    if role == UserRole.CLIENT.value:
        if current_user["user_id"] != client_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        notes = await db.daily_notes.find(
            exclude_deleted({"client_id": client_id}),
            {"_id": 0, "note_id": 1, "created_at": 1, "assessment": 1, "plan": 1}
        ).sort("created_at", -1).to_list(50)
        return notes
    
    if role not in [UserRole.ADMIN.value, UserRole.PHYSIOTHERAPIST.value]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    notes = await db.daily_notes.find(
        exclude_deleted({"client_id": client_id}),
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return notes


@api_router.put("/daily-notes/{note_id}")
async def update_daily_note(
    note_id: str,
    subjective: Optional[str] = Body(None),
    objective: Optional[str] = Body(None),
    assessment: Optional[str] = Body(None),
    plan: Optional[str] = Body(None),
    current_user: dict = Depends(require_roles(UserRole.PHYSIOTHERAPIST))
):
    """Update daily note (same-day only, author only)"""
    note = await db.daily_notes.find_one(
        {"note_id": note_id, "deleted_at": None},
        {"_id": 0}
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note["staff_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Only the author can edit this note")
    
    check_record_editable(note, current_user, allow_same_day=True)
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if subjective:
        update_data["subjective"] = subjective
    if objective:
        update_data["objective"] = objective
    if assessment:
        update_data["assessment"] = assessment
    if plan:
        update_data["plan"] = plan
    
    await db.daily_notes.update_one(
        {"note_id": note_id},
        {"$set": update_data}
    )
    
    return {"message": "Note updated"}


@api_router.put("/daily-notes/{note_id}/lock")
async def lock_daily_note(
    note_id: str,
    current_user: dict = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN))
):
    """Lock daily note"""
    await lock_medical_record(db, "daily_notes", "note_id", note_id, current_user)
    return {"message": "Note locked"}


# ============ DIET PLANS ============

@api_router.get("/diet-plans")
async def get_diet_plans(
    client_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get diet plans"""
    role = current_user["role"]
    user_id = current_user["user_id"]
    
    query = exclude_deleted({"is_active": True})
    
    if role == UserRole.CLIENT.value:
        query["client_id"] = user_id
    elif role == UserRole.NUTRITIONIST.value:
        query["nutritionist_id"] = user_id
    elif client_id and role in [UserRole.ADMIN.value, UserRole.TRAINER.value]:
        query["client_id"] = client_id
    
    plans = await db.diet_plans.find(query, {"_id": 0}).to_list(100)
    return plans


@api_router.post("/diet-plans")
async def create_diet_plan(
    plan_data: DietPlanCreate,
    current_user: dict = Depends(require_roles(UserRole.NUTRITIONIST, UserRole.ADMIN))
):
    """Create a diet plan"""
    await verify_client_access(db, current_user, plan_data.client_id)
    
    plan = DietPlan(
        **plan_data.model_dump(),
        nutritionist_id=current_user["user_id"]
    )
    await db.diet_plans.insert_one(prepare_for_db(plan.model_dump()))
    
    return {"diet_plan_id": plan.diet_plan_id, "message": "Diet plan created"}


# ============ WORKOUT PLANS ============

@api_router.get("/workout-plans")
async def get_workout_plans(
    client_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get workout plans"""
    role = current_user["role"]
    user_id = current_user["user_id"]
    
    query = exclude_deleted({"is_active": True})
    
    if role == UserRole.CLIENT.value:
        query["client_id"] = user_id
    elif role == UserRole.TRAINER.value:
        query["trainer_id"] = user_id
    elif client_id and role == UserRole.ADMIN.value:
        query["client_id"] = client_id
    
    plans = await db.workout_plans.find(query, {"_id": 0}).to_list(100)
    return plans


@api_router.post("/workout-plans")
async def create_workout_plan(
    plan_data: WorkoutPlanCreate,
    current_user: dict = Depends(require_roles(UserRole.TRAINER, UserRole.ADMIN))
):
    """Create a workout plan"""
    await verify_client_access(db, current_user, plan_data.client_id)
    
    plan = WorkoutPlan(
        **plan_data.model_dump(),
        trainer_id=current_user["user_id"]
    )
    await db.workout_plans.insert_one(prepare_for_db(plan.model_dump()))
    
    return {"workout_plan_id": plan.workout_plan_id, "message": "Workout plan created"}


# ============ PROGRESS TRACKING ============

@api_router.post("/progress")
async def record_progress(
    progress_data: ProgressMetricCreate,
    current_user: dict = Depends(get_current_user)
):
    """Record a progress metric"""
    role = current_user["role"]
    
    # Clients can record their own
    if role == UserRole.CLIENT.value and current_user["user_id"] != progress_data.client_id:
        raise HTTPException(status_code=403, detail="You can only record your own progress")
    
    # Staff need client access
    if role != UserRole.CLIENT.value:
        await verify_client_access(db, current_user, progress_data.client_id)
    
    metric = ProgressMetric(
        **progress_data.model_dump(),
        recorded_by=current_user["user_id"]
    )
    await db.progress_metrics.insert_one(prepare_for_db(metric.model_dump()))
    
    return {"metric_id": metric.metric_id, "message": "Progress recorded"}


@api_router.get("/progress/{client_id}")
async def get_progress(
    client_id: str,
    metric_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get progress metrics for a client"""
    role = current_user["role"]
    
    if role == UserRole.CLIENT.value and current_user["user_id"] != client_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = {"client_id": client_id}
    if metric_type:
        query["metric_type"] = metric_type
    
    metrics = await db.progress_metrics.find(query, {"_id": 0}).sort("recorded_at", -1).to_list(500)
    
    # Prepare chart data
    chart_data = {}
    if metrics:
        for m in reversed(metrics):
            mt = m.get("metric_type")
            if mt not in chart_data:
                chart_data[mt] = {"labels": [], "values": [], "unit": m.get("unit")}
            
            recorded_at = m.get("recorded_at")
            if isinstance(recorded_at, str):
                label = recorded_at[:10]
            else:
                label = recorded_at.strftime("%Y-%m-%d")
            
            chart_data[mt]["labels"].append(label)
            chart_data[mt]["values"].append(m.get("value"))
    
    return {"metrics": metrics, "chart_data": chart_data}


# ============ CLASSES & ATTENDANCE ============

@api_router.get("/classes")
async def get_classes(
    date: Optional[str] = None,
    class_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get classes"""
    query = {}
    if date:
        query["scheduled_date"] = date
    if class_type:
        query["class_type"] = class_type
    
    classes = await db.classes.find(query, {"_id": 0}).sort("scheduled_date", -1).to_list(100)
    return classes


@api_router.post("/classes")
async def create_class(
    class_data: dict = Body(...),
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.TRAINER))
):
    """Create a new class"""
    from uuid import uuid4
    class_record = {
        "class_id": f"cls_{str(uuid4())[:8]}",
        "name": class_data.get("name"),
        "class_type": class_data.get("class_type", "general"),
        "scheduled_date": class_data.get("scheduled_date"),
        "scheduled_time": class_data.get("scheduled_time"),
        "max_capacity": class_data.get("max_capacity", 20),
        "enrolled": 0,
        "trainer_id": current_user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.classes.insert_one(class_record)
    return {"class_id": class_record["class_id"], "message": "Class created"}


@api_router.post("/attendance/check-in")
async def check_in(
    data: dict = Body(...),
    current_user: dict = Depends(require_any_staff())
):
    """Check in a client"""
    from uuid import uuid4
    attendance = {
        "attendance_id": f"att_{str(uuid4())[:8]}",
        "client_id": data.get("client_id"),
        "appointment_id": data.get("appointment_id"),
        "class_id": data.get("class_id"),
        "check_in": datetime.now(timezone.utc).isoformat(),
        "recorded_by": current_user["user_id"]
    }
    await db.attendance.insert_one(attendance)
    return {"attendance_id": attendance["attendance_id"], "message": "Check-in recorded"}


# ============ DIET TEMPLATES ============

@api_router.get("/diet-templates")
async def get_diet_templates(
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.NUTRITIONIST))
):
    """Get diet plan templates"""
    templates = await db.diet_templates.find({}, {"_id": 0}).to_list(100)
    return templates


@api_router.post("/diet-templates")
async def create_diet_template(
    template_data: dict = Body(...),
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.NUTRITIONIST))
):
    """Create a diet template"""
    from uuid import uuid4
    template = {
        "template_id": f"diettpl_{str(uuid4())[:8]}",
        "name": template_data.get("name"),
        "plan_type": template_data.get("plan_type", "general"),
        "meals": template_data.get("meals", []),
        "daily_calories": template_data.get("daily_calories"),
        "description": template_data.get("description"),
        "created_by": current_user["user_id"],
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.diet_templates.insert_one(template)
    return {"template_id": template["template_id"], "message": "Template created"}


# ============ BILLING & PAYMENTS ============

@api_router.post("/invoices")
async def create_invoice(
    invoice_data: InvoiceCreate,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Create an invoice"""
    items = [item.model_dump() for item in invoice_data.items]
    subtotal = sum(item["total"] for item in items)
    tax = subtotal * 0.18  # 18% GST
    total = subtotal + tax
    
    invoice = Invoice(
        client_id=invoice_data.client_id,
        items=items,
        subtotal=subtotal,
        tax=tax,
        total=total,
        notes=invoice_data.notes,
        appointment_id=invoice_data.appointment_id,
        membership_id=invoice_data.membership_id,
        created_by=current_user["user_id"]
    )
    await db.invoices.insert_one(prepare_for_db(invoice.model_dump()))
    
    await create_audit_log(
        db, current_user, AuditAction.CREATE, "invoices", invoice.invoice_id,
        new_value={"client_id": invoice_data.client_id, "total": total}
    )
    
    return {"invoice_id": invoice.invoice_id, "invoice_number": invoice.invoice_number, "total": total}


@api_router.get("/invoices")
async def get_invoices(
    client_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get invoices"""
    role = current_user["role"]
    
    query = exclude_deleted()
    if role == UserRole.CLIENT.value:
        query["client_id"] = current_user["user_id"]
    elif client_id:
        query["client_id"] = client_id
    
    if status:
        query["status"] = status
    
    invoices = await db.invoices.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    
    # Enrich with client info
    for inv in invoices:
        client = await db.users.find_one({"user_id": inv["client_id"]}, {"_id": 0, "name": 1})
        inv["client_name"] = client.get("name") if client else "Unknown"
    
    return invoices


@api_router.get("/invoices/{invoice_id}")
async def get_invoice_detail(
    invoice_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get invoice details"""
    invoice = await db.invoices.find_one(
        {"invoice_id": invoice_id, "deleted_at": None},
        {"_id": 0}
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check access
    role = current_user["role"]
    if role == UserRole.CLIENT.value and invoice["client_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get client info
    client = await db.users.find_one({"user_id": invoice["client_id"]}, {"_id": 0, "name": 1, "email": 1, "phone": 1})
    invoice["client"] = client
    
    # Get payment info
    payment = await db.payments.find_one(
        {"invoice_id": invoice_id, "status": PaymentStatus.COMPLETED.value},
        {"_id": 0}
    )
    invoice["payment"] = payment
    
    return invoice


@api_router.post("/payments/create-order")
async def create_payment_order(
    payment_data: PaymentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create Razorpay order"""
    # Get invoice
    invoice = await db.invoices.find_one(
        {"invoice_id": payment_data.invoice_id, "deleted_at": None},
        {"_id": 0}
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Verify client access
    if current_user["role"] == UserRole.CLIENT.value and invoice["client_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if mock mode
    settings = await db.settings.find_one({"setting_id": "settings_main"})
    mock_mode = payment_data.mock_mode or (settings and settings.get("razorpay_mock_mode", True))
    
    if mock_mode:
        # Mock payment order
        order_id = f"mock_order_{generate_id('')}"
        
        payment = Payment(
            invoice_id=payment_data.invoice_id,
            client_id=invoice["client_id"],
            amount=payment_data.amount,
            payment_method="razorpay",
            razorpay_order_id=order_id,
            mock_mode=True
        )
        await db.payments.insert_one(prepare_for_db(payment.model_dump()))
        
        return {
            "order_id": order_id,
            "amount": int(payment_data.amount * 100),  # Razorpay uses paise
            "currency": "INR",
            "key_id": "mock_key",
            "mock_mode": True,
            "payment_id": payment.payment_id
        }
    
    # Real Razorpay integration
    razorpay_key = os.environ.get("RAZORPAY_KEY_ID")
    razorpay_secret = os.environ.get("RAZORPAY_KEY_SECRET")
    
    if not razorpay_key or not razorpay_secret:
        raise HTTPException(status_code=500, detail="Razorpay not configured")
    
    # Create Razorpay order
    import razorpay
    rz_client = razorpay.Client(auth=(razorpay_key, razorpay_secret))
    
    order_data = {
        "amount": int(payment_data.amount * 100),
        "currency": "INR",
        "receipt": invoice["invoice_number"]
    }
    
    order = rz_client.order.create(data=order_data)
    
    payment = Payment(
        invoice_id=payment_data.invoice_id,
        client_id=invoice["client_id"],
        amount=payment_data.amount,
        payment_method="razorpay",
        razorpay_order_id=order["id"],
        mock_mode=False
    )
    await db.payments.insert_one(prepare_for_db(payment.model_dump()))
    
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": razorpay_key,
        "mock_mode": False,
        "payment_id": payment.payment_id
    }


@api_router.post("/payments/verify")
async def verify_payment(
    invoice_id: str = Body(...),
    razorpay_order_id: str = Body(...),
    razorpay_payment_id: str = Body(...),
    razorpay_signature: Optional[str] = Body(None),
    current_user: dict = Depends(get_current_user)
):
    """Verify Razorpay payment"""
    payment = await db.payments.find_one(
        {"invoice_id": invoice_id, "razorpay_order_id": razorpay_order_id},
        {"_id": 0}
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    mock_mode = payment.get("mock_mode", False)
    
    if not mock_mode and razorpay_signature:
        # Verify signature for real payments
        import razorpay
        import hmac
        import hashlib
        
        razorpay_secret = os.environ.get("RAZORPAY_KEY_SECRET")
        
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            razorpay_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != razorpay_signature:
            await db.payments.update_one(
                {"payment_id": payment["payment_id"]},
                {"$set": {"status": PaymentStatus.FAILED.value}}
            )
            raise HTTPException(status_code=400, detail="Payment verification failed")
    
    # Update payment status
    await db.payments.update_one(
        {"payment_id": payment["payment_id"]},
        {"$set": {
            "status": PaymentStatus.COMPLETED.value,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        }}
    )
    
    # Update invoice status
    await db.invoices.update_one(
        {"invoice_id": invoice_id},
        {"$set": {"status": PaymentStatus.COMPLETED.value}}
    )
    
    # Create receipt
    receipt = Receipt(
        payment_id=payment["payment_id"],
        invoice_id=invoice_id,
        client_id=payment["client_id"],
        amount=payment["amount"],
        payment_method="razorpay"
    )
    await db.receipts.insert_one(prepare_for_db(receipt.model_dump()))
    
    await create_audit_log(
        db, current_user, AuditAction.CREATE, "payments", payment["payment_id"],
        new_value={"status": "completed", "amount": payment["amount"]}
    )
    
    return {
        "payment_id": payment["payment_id"],
        "status": "completed",
        "receipt_id": receipt.receipt_id
    }


@api_router.post("/payments/mock-complete/{payment_id}")
async def mock_complete_payment(
    payment_id: str,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Complete a mock payment (for testing)"""
    payment = await db.payments.find_one(
        {"payment_id": payment_id, "mock_mode": True},
        {"_id": 0}
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Mock payment not found")
    
    # Update payment
    await db.payments.update_one(
        {"payment_id": payment_id},
        {"$set": {
            "status": PaymentStatus.COMPLETED.value,
            "razorpay_payment_id": f"mock_pay_{generate_id('')}"
        }}
    )
    
    # Update invoice
    await db.invoices.update_one(
        {"invoice_id": payment["invoice_id"]},
        {"$set": {"status": PaymentStatus.COMPLETED.value}}
    )
    
    # Create receipt
    receipt = Receipt(
        payment_id=payment_id,
        invoice_id=payment["invoice_id"],
        client_id=payment["client_id"],
        amount=payment["amount"],
        payment_method="mock"
    )
    await db.receipts.insert_one(prepare_for_db(receipt.model_dump()))
    
    return {"status": "completed", "receipt_id": receipt.receipt_id}


# ============ NOTIFICATIONS ============

@api_router.get("/notifications")
async def get_notifications(
    current_user: dict = Depends(get_current_user)
):
    """Get user's notifications"""
    notifications = await db.notifications.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return notifications


@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark notification as read"""
    await db.notifications.update_one(
        {"notification_id": notification_id, "user_id": current_user["user_id"]},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Notification marked as read"}


@api_router.post("/notifications/send")
async def send_notification(
    user_ids: List[str] = Body(...),
    title: str = Body(...),
    message: str = Body(...),
    notification_type: NotificationType = Body(NotificationType.SYSTEM),
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Send notification to users"""
    notifications = []
    for user_id in user_ids:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type
        )
        notifications.append(prepare_for_db(notif.model_dump()))
    
    if notifications:
        await db.notifications.insert_many(notifications)
    
    return {"message": f"Sent {len(notifications)} notifications"}


# ============ ATTENDANCE ============

@api_router.post("/attendance/check-in")
async def check_in(
    client_id: str = Body(...),
    appointment_id: Optional[str] = Body(None),
    class_id: Optional[str] = Body(None),
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION, UserRole.PHYSIOTHERAPIST, UserRole.TRAINER))
):
    """Record client check-in"""
    attendance = AttendanceLog(
        client_id=client_id,
        appointment_id=appointment_id,
        class_id=class_id,
        check_in=datetime.now(timezone.utc),
        recorded_by=current_user["user_id"]
    )
    await db.attendance_logs.insert_one(prepare_for_db(attendance.model_dump()))
    
    return {"attendance_id": attendance.attendance_id, "message": "Check-in recorded"}


@api_router.put("/attendance/{attendance_id}/check-out")
async def check_out(
    attendance_id: str,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION, UserRole.PHYSIOTHERAPIST, UserRole.TRAINER))
):
    """Record client check-out"""
    await db.attendance_logs.update_one(
        {"attendance_id": attendance_id},
        {"$set": {"check_out": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Check-out recorded"}


@api_router.get("/attendance")
async def get_attendance(
    client_id: Optional[str] = None,
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get attendance logs"""
    query = {}
    
    if current_user["role"] == UserRole.CLIENT.value:
        query["client_id"] = current_user["user_id"]
    elif client_id:
        query["client_id"] = client_id
    
    if date:
        # Filter by date (check_in starts with date)
        query["check_in"] = {"$regex": f"^{date}"}
    
    logs = await db.attendance_logs.find(query, {"_id": 0}).sort("check_in", -1).to_list(500)
    return logs


# ============ DASHBOARD STATS ============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics based on role"""
    role = current_user["role"]
    user_id = current_user["user_id"]
    stats = {}
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    if role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]:
        stats["total_clients"] = await db.users.count_documents(
            {"role": UserRole.CLIENT.value, "deleted_at": None}
        )
        stats["pending_bookings"] = await db.guest_bookings.count_documents(
            {"status": GuestBookingStatus.PENDING.value, "deleted_at": None}
        )
        stats["today_appointments"] = await db.appointments.count_documents(
            {"scheduled_date": today, "deleted_at": None}
        )
        stats["active_memberships"] = await db.memberships.count_documents(
            {"is_active": True, "deleted_at": None}
        )
        
        # Revenue this month
        first_of_month = datetime.now(timezone.utc).replace(day=1).strftime("%Y-%m-%d")
        pipeline = [
            {"$match": {"status": PaymentStatus.COMPLETED.value, "created_at": {"$gte": first_of_month}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        revenue = await db.payments.aggregate(pipeline).to_list(1)
        stats["monthly_revenue"] = revenue[0]["total"] if revenue else 0
        
        # Pending payments
        pending_pipeline = [
            {"$match": {"status": PaymentStatus.PENDING.value}},
            {"$group": {"_id": None, "total": {"$sum": "$total"}}}
        ]
        pending = await db.invoices.aggregate(pending_pipeline).to_list(1)
        stats["pending_payments"] = pending[0]["total"] if pending else 0
    
    elif role == UserRole.CLIENT.value:
        stats["upcoming_appointments"] = await db.appointments.count_documents({
            "client_id": user_id,
            "status": {"$in": [AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value]},
            "deleted_at": None
        })
        stats["active_plans"] = await db.treatment_plans.count_documents({
            "client_id": user_id,
            "is_active": True,
            "deleted_at": None
        })
        
        # Sessions remaining from membership
        membership = await db.memberships.find_one(
            {"client_id": user_id, "is_active": True, "deleted_at": None}
        )
        stats["sessions_remaining"] = membership.get("sessions_remaining", 0) if membership else 0
        
        stats["unread_messages"] = await db.notifications.count_documents({
            "user_id": user_id,
            "is_read": False
        })
    
    elif role == UserRole.PHYSIOTHERAPIST.value:
        assigned_clients = await get_assigned_clients(db, user_id, role)
        stats["assigned_patients"] = len(assigned_clients)
        stats["today_sessions"] = await db.appointments.count_documents({
            "staff_id": user_id,
            "scheduled_date": today,
            "deleted_at": None
        })
        stats["pending_assessments"] = await db.assessments.count_documents({
            "staff_id": user_id,
            "is_locked": False,
            "deleted_at": None
        })
        stats["active_treatment_plans"] = await db.treatment_plans.count_documents({
            "staff_id": user_id,
            "is_active": True,
            "deleted_at": None
        })
    
    elif role == UserRole.TRAINER.value:
        assigned_clients = await get_assigned_clients(db, user_id, role)
        stats["assigned_members"] = len(assigned_clients)
        stats["today_classes"] = await db.appointments.count_documents({
            "staff_id": user_id,
            "scheduled_date": today,
            "deleted_at": None
        })
        stats["active_workout_plans"] = await db.workout_plans.count_documents({
            "trainer_id": user_id,
            "is_active": True,
            "deleted_at": None
        })
    
    elif role == UserRole.NUTRITIONIST.value:
        assigned_clients = await get_assigned_clients(db, user_id, role)
        stats["assigned_clients"] = len(assigned_clients)
        stats["active_diet_plans"] = await db.diet_plans.count_documents({
            "nutritionist_id": user_id,
            "is_active": True,
            "deleted_at": None
        })
    
    return stats


# ============ AUDIT LOGS (Admin Only) ============

@api_router.get("/audit-logs")
async def get_audit_logs(
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Get audit logs (Admin only)"""
    query = {}
    
    if user_id:
        query["user_id"] = user_id
    if action:
        query["action"] = action
    if entity_type:
        query["entity_type"] = entity_type
    if date_from:
        query.setdefault("created_at", {})["$gte"] = date_from
    if date_to:
        query.setdefault("created_at", {})["$lte"] = date_to
    
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return logs


# ============ WEBSITE CONTENT ============

@api_router.get("/testimonials")
async def get_testimonials():
    """Get visible testimonials (public)"""
    testimonials = await db.testimonials.find(
        exclude_deleted({"is_visible": True}), 
        {"_id": 0}
    ).sort("order", 1).to_list(20)
    return testimonials


@api_router.post("/testimonials")
async def create_testimonial(
    client_name: str = Body(...),
    content: str = Body(...),
    rating: int = Body(5),
    service_category: Optional[str] = Body(None),
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Create a testimonial (Admin only)"""
    testimonial = Testimonial(
        client_name=client_name,
        content=content,
        rating=rating,
        service_category=ServiceCategory(service_category) if service_category else None
    )
    await db.testimonials.insert_one(prepare_for_db(testimonial.model_dump()))
    
    return {"testimonial_id": testimonial.testimonial_id}


@api_router.get("/faqs")
async def get_faqs(category: Optional[str] = None):
    """Get FAQs (public)"""
    query = exclude_deleted({"is_visible": True})
    if category:
        query["category"] = category
    
    faqs = await db.faqs.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return faqs


@api_router.get("/gallery")
async def get_gallery(category: Optional[str] = None):
    """Get gallery images (public)"""
    query = exclude_deleted({"is_visible": True})
    if category:
        query["category"] = category
    
    images = await db.gallery.find(query, {"_id": 0}).sort("order", 1).to_list(50)
    return images


# ============ SYSTEM SETTINGS (Admin Only) ============

@api_router.get("/settings")
async def get_settings(current_user: dict = Depends(require_roles(UserRole.ADMIN))):
    """Get system settings"""
    settings = await db.settings.find_one({"setting_id": "settings_main"}, {"_id": 0})
    return settings or SystemSettings().model_dump()


@api_router.put("/settings")
async def update_settings(
    settings_data: Dict[str, Any] = Body(...),
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Update system settings"""
    settings_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    settings_data["updated_by"] = current_user["user_id"]
    
    await db.settings.update_one(
        {"setting_id": "settings_main"},
        {"$set": settings_data},
        upsert=True
    )
    
    await create_audit_log(
        db, current_user, AuditAction.UPDATE, "settings", "settings_main",
        new_value=settings_data
    )
    
    return {"message": "Settings updated"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_id(prefix: str = "") -> str:
    import uuid
    return f"{prefix}{uuid.uuid4().hex[:12]}"


@app.on_event("startup")
async def startup_db():
    """Initialize database with seed data"""
    # Create indexes (using drop_duplicates to avoid conflicts)
    try:
        await db.users.create_index("email", unique=True, background=True)
    except Exception:
        pass  # Index already exists
    
    try:
        await db.users.create_index("user_id", unique=True, background=True)
    except Exception:
        pass
    
    try:
        await db.users.create_index("phone", background=True)
    except Exception:
        pass
    
    try:
        await db.appointments.create_index("scheduled_date", background=True)
        await db.appointments.create_index("client_id", background=True)
        await db.appointments.create_index("staff_id", background=True)
    except Exception:
        pass
    
    try:
        await db.guest_bookings.create_index("status", background=True)
        await db.audit_logs.create_index("created_at", background=True)
        await db.audit_logs.create_index("user_id", background=True)
        await db.client_profiles.create_index("user_id", unique=True, background=True)
        await db.exercise_assignments.create_index("client_id", background=True)
    except Exception:
        pass
    
    # Seed default services if none exist
    services_count = await db.services.count_documents({})
    if services_count == 0:
        default_services = [
            {
                "service_id": "svc_paed_assess",
                "name": "Paediatric Assessment",
                "description": "Comprehensive developmental assessment for children",
                "category": "paediatric_physio",
                "duration_minutes": 60,
                "price": 1500,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            },
            {
                "service_id": "svc_paed_therapy",
                "name": "Paediatric Therapy Session",
                "description": "Individual therapy session for children",
                "category": "paediatric_physio",
                "duration_minutes": 45,
                "price": 800,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            },
            {
                "service_id": "svc_weight_consult",
                "name": "Weight Management Consultation",
                "description": "Personal consultation for weight management",
                "category": "weight_management",
                "duration_minutes": 45,
                "price": 1000,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            },
            {
                "service_id": "svc_pcod_program",
                "name": "PCOD Wellness Program",
                "description": "Specialized program for PCOD management",
                "category": "pcod",
                "duration_minutes": 60,
                "price": 1200,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            },
            {
                "service_id": "svc_zumba",
                "name": "Zumba Class",
                "description": "Fun group fitness class",
                "category": "zumba_aerobics_yoga",
                "duration_minutes": 60,
                "price": 500,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            },
            {
                "service_id": "svc_yoga",
                "name": "Yoga Session",
                "description": "Guided yoga for flexibility and wellness",
                "category": "zumba_aerobics_yoga",
                "duration_minutes": 60,
                "price": 600,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            },
            {
                "service_id": "svc_pain",
                "name": "Pain Management Session",
                "description": "Physiotherapy for pain relief",
                "category": "pain_management",
                "duration_minutes": 45,
                "price": 900,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            }
        ]
        await db.services.insert_many(default_services)
        logger.info("Seeded default services")
    
    # Seed FAQs
    faqs_count = await db.faqs.count_documents({})
    if faqs_count == 0:
        default_faqs = [
            {
                "faq_id": "faq_1",
                "question": "What age children do you treat?",
                "answer": "We treat children from newborns to 18 years old. Our paediatric physiotherapists are specialized in developmental milestones, neurological conditions, and orthopaedic issues in children.",
                "category": "paediatric",
                "order": 1,
                "is_visible": True,
                "deleted_at": None
            },
            {
                "faq_id": "faq_2",
                "question": "How does the PCOD program work?",
                "answer": "Our PCOD program is a holistic approach combining guided exercises, nutrition planning, and lifestyle modifications. We track your progress with optional cycle logging (with your consent) to provide personalized recommendations.",
                "category": "women",
                "order": 2,
                "is_visible": True,
                "deleted_at": None
            },
            {
                "faq_id": "faq_3",
                "question": "Can I book an online consultation?",
                "answer": "Yes! We offer online consultations for follow-ups and initial assessments. You'll receive a secure meeting link via WhatsApp/email before your appointment.",
                "category": "general",
                "order": 3,
                "is_visible": True,
                "deleted_at": None
            },
            {
                "faq_id": "faq_4",
                "question": "What payment methods do you accept?",
                "answer": "We accept UPI, credit/debit cards, net banking, and cash payments. You can also opt for package memberships with convenient payment plans.",
                "category": "billing",
                "order": 4,
                "is_visible": True,
                "deleted_at": None
            }
        ]
        await db.faqs.insert_many(default_faqs)
        logger.info("Seeded default FAQs")
    
    # Seed testimonials (Pre-launch - Vision statements only)
    testimonials_count = await db.testimonials.count_documents({})
    if testimonials_count == 0:
        default_testimonials = [
            {
                "testimonial_id": "test_1",
                "client_name": "Our Vision",
                "content": "Built on hands-on clinical experience and a patient-first approach. We're excited to bring personalised paediatric and women's wellness care to our community.",
                "rating": 0,
                "is_visible": True,
                "is_prelaunch": True,
                "order": 1,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            },
            {
                "testimonial_id": "test_2",
                "client_name": "Our Promise",
                "content": "Designed to deliver structured, ethical, and personalised care. We look forward to sharing real client experiences after our official launch in 2026.",
                "rating": 0,
                "is_visible": True,
                "is_prelaunch": True,
                "order": 2,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            },
            {
                "testimonial_id": "test_3",
                "client_name": "Coming Soon",
                "content": "Excited to begin our wellness journey here. Testimonials will be shared as our story unfolds starting 2026.",
                "rating": 0,
                "is_visible": True,
                "is_prelaunch": True,
                "order": 3,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            }
        ]
        await db.testimonials.insert_many(default_testimonials)
        logger.info("Seeded pre-launch testimonials")
    
    # Create demo users for all roles
    demo_users = [
        {
            "user_id": "user_admin001",
            "email": "admin@demo.com",
            "name": "Admin Demo",
            "role": UserRole.ADMIN.value,
            "password_hash": hash_password("Demo@12345"),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "deleted_at": None
        },
        {
            "user_id": "user_reception001",
            "email": "reception@demo.com",
            "name": "Reception Demo",
            "role": UserRole.RECEPTION.value,
            "password_hash": hash_password("Demo@12345"),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "deleted_at": None
        },
        {
            "user_id": "user_physio001",
            "email": "physio@demo.com",
            "name": "Dr. Physio Demo",
            "role": UserRole.PHYSIOTHERAPIST.value,
            "password_hash": hash_password("Demo@12345"),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "deleted_at": None
        },
        {
            "user_id": "user_trainer001",
            "email": "trainer@demo.com",
            "name": "Trainer Demo",
            "role": UserRole.TRAINER.value,
            "password_hash": hash_password("Demo@12345"),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "deleted_at": None
        },
        {
            "user_id": "user_nutrition001",
            "email": "nutrition@demo.com",
            "name": "Nutritionist Demo",
            "role": UserRole.NUTRITIONIST.value,
            "password_hash": hash_password("Demo@12345"),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "deleted_at": None
        },
        {
            "user_id": "user_client001",
            "email": "client@demo.com",
            "name": "Client Demo",
            "role": UserRole.CLIENT.value,
            "password_hash": hash_password("Demo@12345"),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "deleted_at": None
        }
    ]
    
    for demo_user in demo_users:
        existing = await db.users.find_one({"email": demo_user["email"]})
        if not existing:
            await db.users.insert_one(demo_user)
            logger.info(f"Created demo user: {demo_user['email']}")
            
            # Create client profile for client demo user
            if demo_user["role"] == UserRole.CLIENT.value:
                client_profile = {
                    "profile_id": f"prof_{demo_user['user_id']}",
                    "user_id": demo_user["user_id"],
                    "client_type": "woman",
                    "goal": "Weight Loss & Fitness",
                    "pcod_tracking": True,
                    "preferred_batch": "Morning",
                    "assigned_trainer": "user_trainer001",
                    "assigned_nutritionist": "user_nutrition001",
                    "assigned_physio": "user_physio001",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.client_profiles.update_one(
                    {"user_id": demo_user["user_id"]},
                    {"$set": client_profile},
                    upsert=True
                )
                logger.info("Created client profile for demo client")
    
    # Create default system settings
    settings_exists = await db.settings.find_one({"setting_id": "settings_main"})
    if not settings_exists:
        settings = SystemSettings()
        await db.settings.insert_one(prepare_for_db(settings.model_dump()))
        logger.info("Created default system settings")
    
    # Seed sample exercises
    exercises_count = await db.exercises.count_documents({})
    if exercises_count == 0:
        default_exercises = [
            {
                "exercise_id": "ex_stretch_neck",
                "name": "Neck Stretches",
                "description": "Gentle neck stretching exercises for pain relief",
                "category": "flexibility",
                "instructions": [
                    "Sit or stand with good posture",
                    "Slowly tilt head to right, hold 15 seconds",
                    "Return to center, repeat on left",
                    "Gently rotate head in circles"
                ],
                "contraindications": ["Acute neck injury", "Cervical spine instability"],
                "pcod_safe": True,
                "min_age": 10,
                "max_age": 100,
                "sets": 2,
                "reps": 5,
                "created_by": "user_admin001",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            },
            {
                "exercise_id": "ex_balance_1",
                "name": "Single Leg Balance",
                "description": "Balance exercise for coordination and stability",
                "category": "balance",
                "instructions": [
                    "Stand on one leg",
                    "Hold for 30 seconds",
                    "Switch legs",
                    "Repeat 3 times each side"
                ],
                "contraindications": ["Severe vertigo", "Lower limb fracture"],
                "pcod_safe": True,
                "min_age": 5,
                "max_age": 80,
                "sets": 3,
                "reps": 1,
                "duration_seconds": 30,
                "created_by": "user_admin001",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            },
            {
                "exercise_id": "ex_breathing_1",
                "name": "Diaphragmatic Breathing",
                "description": "Deep breathing for relaxation and core activation",
                "category": "breathing",
                "instructions": [
                    "Lie on back with knees bent",
                    "Place hand on belly",
                    "Breathe in through nose, belly rises",
                    "Exhale slowly through mouth",
                    "Repeat for 5 minutes"
                ],
                "contraindications": ["None"],
                "pcod_safe": True,
                "min_age": 3,
                "max_age": 100,
                "duration_seconds": 300,
                "created_by": "user_admin001",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "deleted_at": None
            }
        ]
        await db.exercises.insert_many(default_exercises)
        logger.info("Seeded default exercises")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
