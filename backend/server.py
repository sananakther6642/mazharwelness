from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from models import (
    User, UserCreate, UserLogin, UserRole, UserSession,
    ClientProfile, ClientType, ParentProfile, WomanProfile,
    StaffProfile, Service, ServiceCategory, ServiceBase,
    Package, PackageBase, GuestBooking, GuestBookingCreate,
    Appointment, AppointmentCreate, AppointmentStatus,
    Membership, MembershipCreate, Invoice, InvoiceCreate, InvoiceItem,
    Payment, PaymentCreate, PaymentStatus,
    Assessment, AssessmentCreate, TreatmentPlan, TreatmentPlanCreate,
    DailyNote, Exercise, ExerciseCreate, ExerciseAssignment,
    DietPlan, DietPlanCreate, WorkoutPlan, WorkoutPlanCreate,
    ProgressMetric, AttendanceLog, Message, Notification,
    Testimonial, FAQ, GalleryImage
)
from auth import (
    hash_password, verify_password, create_jwt_token, decode_jwt_token,
    get_current_user, require_roles, can_access_finance, can_manage_staff,
    can_delete_records, can_change_pricing
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


# ============ HEALTH CHECK ============
@api_router.get("/")
async def root():
    return {"message": "Mazhar Wellness API", "status": "healthy"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        role=user_data.role
    )
    user_dict = user.model_dump()
    user_dict["password_hash"] = hash_password(user_data.password)
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    user_dict["updated_at"] = user_dict["updated_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create JWT token
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
async def login(credentials: UserLogin, response: Response):
    """Login with email and password"""
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is disabled")
    
    # Create JWT token
    token = create_jwt_token(user["user_id"], user["email"], user["role"])
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,  # 7 days
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


@api_router.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    """Process Google OAuth session from Emergent Auth"""
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    # Call Emergent Auth to get user data
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
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        # Update existing user
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        user_id = existing_user["user_id"]
        role = existing_user["role"]
    else:
        # Create new user
        user = User(
            email=email,
            name=name,
            picture=picture,
            role=UserRole.CLIENT
        )
        user_dict = user.model_dump()
        user_dict["created_at"] = user_dict["created_at"].isoformat()
        user_dict["updated_at"] = user_dict["updated_at"].isoformat()
        await db.users.insert_one(user_dict)
        user_id = user.user_id
        role = UserRole.CLIENT.value
    
    # Create JWT token
    token = create_jwt_token(user_id, email, role)
    
    # Set cookie
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
    user = await db.users.find_one({"user_id": current_user["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@api_router.post("/auth/logout")
async def logout(response: Response):
    """Logout user"""
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}


# ============ CLIENT REGISTRATION ============

@api_router.post("/clients/register/parent")
async def register_parent(profile: ParentProfile, current_user: dict = Depends(get_current_user)):
    """Register parent client profile (for paediatric)"""
    client_profile = ClientProfile(
        user_id=current_user["user_id"],
        client_type=ClientType.PARENT,
        child_name=profile.child_name,
        child_age=profile.child_age,
        child_condition=profile.child_condition,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        goal=profile.goal,
        medical_conditions=profile.medical_conditions,
        emergency_contact=profile.emergency_contact
    )
    
    profile_dict = client_profile.model_dump()
    profile_dict["created_at"] = profile_dict["created_at"].isoformat()
    await db.client_profiles.insert_one(profile_dict)
    
    return {"profile_id": client_profile.profile_id, "message": "Parent profile created"}


@api_router.post("/clients/register/woman")
async def register_woman(profile: WomanProfile, current_user: dict = Depends(get_current_user)):
    """Register woman client profile (for fitness/PCOD)"""
    client_profile = ClientProfile(
        user_id=current_user["user_id"],
        client_type=ClientType.WOMAN,
        age=profile.age,
        pcod_tracking=profile.pcod_tracking,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        goal=profile.goal,
        preferred_batch=profile.preferred_batch,
        medical_conditions=profile.medical_conditions,
        emergency_contact=profile.emergency_contact
    )
    
    profile_dict = client_profile.model_dump()
    profile_dict["created_at"] = profile_dict["created_at"].isoformat()
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


# ============ GUEST BOOKING (NO AUTH) ============

@api_router.post("/guest/booking")
async def create_guest_booking(booking: GuestBookingCreate):
    """Create a guest booking (no authentication required)"""
    guest_booking = GuestBooking(**booking.model_dump())
    booking_dict = guest_booking.model_dump()
    booking_dict["created_at"] = booking_dict["created_at"].isoformat()
    
    await db.guest_bookings.insert_one(booking_dict)
    
    # TODO: Send notification to reception/admin (Twilio integration)
    
    return {
        "booking_id": guest_booking.booking_id,
        "message": "Thank you! Your booking request has been received. Our team will contact you shortly."
    }


@api_router.get("/guest/bookings")
async def get_guest_bookings(
    status: Optional[str] = None,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Get all guest bookings (Admin/Reception only)"""
    query = {}
    if status:
        query["status"] = status
    
    bookings = await db.guest_bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bookings


@api_router.put("/guest/bookings/{booking_id}")
async def update_guest_booking(
    booking_id: str,
    status: str,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Update guest booking status"""
    update_data = {"status": status}
    if notes:
        update_data["notes"] = notes
    update_data["assigned_to"] = current_user["user_id"]
    
    result = await db.guest_bookings.update_one(
        {"booking_id": booking_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Booking updated"}


# ============ SERVICES ============

@api_router.get("/services")
async def get_services(category: Optional[str] = None):
    """Get all active services (public)"""
    query = {"is_active": True}
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
    service = Service(**service_data.model_dump())
    service_dict = service.model_dump()
    service_dict["created_at"] = service_dict["created_at"].isoformat()
    
    await db.services.insert_one(service_dict)
    return {"service_id": service.service_id, "message": "Service created"}


@api_router.put("/services/{service_id}")
async def update_service(
    service_id: str,
    service_data: ServiceBase,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Update a service (Admin only)"""
    result = await db.services.update_one(
        {"service_id": service_id},
        {"$set": service_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return {"message": "Service updated"}


# ============ PACKAGES ============

@api_router.get("/packages")
async def get_packages():
    """Get all active packages (public)"""
    packages = await db.packages.find({"is_active": True}, {"_id": 0}).to_list(100)
    return packages


@api_router.post("/packages")
async def create_package(
    package_data: PackageBase,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Create a new package (Admin only)"""
    package = Package(**package_data.model_dump())
    package_dict = package.model_dump()
    package_dict["created_at"] = package_dict["created_at"].isoformat()
    
    await db.packages.insert_one(package_dict)
    return {"package_id": package.package_id, "message": "Package created"}


# ============ APPOINTMENTS ============

@api_router.post("/appointments")
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION, UserRole.CLIENT))
):
    """Create a new appointment"""
    # If client is creating, they can only book for themselves
    if current_user["role"] == UserRole.CLIENT.value:
        appointment_data.client_id = current_user["user_id"]
    
    appointment = Appointment(**appointment_data.model_dump())
    appointment_dict = appointment.model_dump()
    appointment_dict["created_at"] = appointment_dict["created_at"].isoformat()
    appointment_dict["updated_at"] = appointment_dict["updated_at"].isoformat()
    
    await db.appointments.insert_one(appointment_dict)
    
    # TODO: Send notification to client and staff
    
    return {"appointment_id": appointment.appointment_id, "message": "Appointment created"}


@api_router.get("/appointments")
async def get_appointments(
    client_id: Optional[str] = None,
    staff_id: Optional[str] = None,
    status: Optional[str] = None,
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get appointments based on role"""
    query = {}
    
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
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("scheduled_date", -1).to_list(1000)
    return appointments


@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status: AppointmentStatus,
    current_user: dict = Depends(get_current_user)
):
    """Update appointment status"""
    # Verify access
    appointment = await db.appointments.find_one({"appointment_id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    role = current_user["role"]
    user_id = current_user["user_id"]
    
    # Check permissions
    can_update = (
        role in [UserRole.ADMIN.value, UserRole.RECEPTION.value] or
        appointment["staff_id"] == user_id or
        (appointment["client_id"] == user_id and status == AppointmentStatus.CANCELLED)
    )
    
    if not can_update:
        raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
    
    await db.appointments.update_one(
        {"appointment_id": appointment_id},
        {"$set": {"status": status.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Appointment status updated"}


# ============ STAFF MANAGEMENT ============

@api_router.get("/staff")
async def get_staff(
    role: Optional[str] = None,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Get all staff members"""
    query = {"role": {"$ne": UserRole.CLIENT.value}}
    if role:
        query["role"] = role
    
    staff = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(100)
    return staff


@api_router.get("/staff/available")
async def get_available_staff(service_category: Optional[str] = None):
    """Get available staff for booking (public)"""
    query = {
        "role": {"$in": [
            UserRole.PHYSIOTHERAPIST.value,
            UserRole.TRAINER.value,
            UserRole.NUTRITIONIST.value
        ]},
        "is_active": True
    }
    
    staff = await db.users.find(query, {"_id": 0, "password_hash": 0, "email": 0}).to_list(100)
    return staff


@api_router.post("/staff")
async def create_staff(
    user_data: UserCreate,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Create a new staff member (Admin only)"""
    if user_data.role == UserRole.CLIENT:
        raise HTTPException(status_code=400, detail="Use client registration for clients")
    
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        role=user_data.role
    )
    user_dict = user.model_dump()
    user_dict["password_hash"] = hash_password(user_data.password)
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    user_dict["updated_at"] = user_dict["updated_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    return {"user_id": user.user_id, "message": f"Staff member created with role: {user.role.value}"}


# ============ EXERCISE LIBRARY ============

@api_router.get("/exercises")
async def get_exercises(
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get exercises from library"""
    role = current_user["role"]
    
    # Reception cannot access
    if role == UserRole.RECEPTION.value:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = {"is_active": True}
    
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
    exercise_dict = exercise.model_dump()
    exercise_dict["created_at"] = exercise_dict["created_at"].isoformat()
    
    await db.exercises.insert_one(exercise_dict)
    return {"exercise_id": exercise.exercise_id, "message": "Exercise created"}


# ============ DIET PLANS ============

@api_router.get("/diet-plans")
async def get_diet_plans(
    client_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get diet plans"""
    role = current_user["role"]
    user_id = current_user["user_id"]
    
    query = {"is_active": True}
    
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
    plan = DietPlan(
        **plan_data.model_dump(),
        nutritionist_id=current_user["user_id"]
    )
    plan_dict = plan.model_dump()
    plan_dict["created_at"] = plan_dict["created_at"].isoformat()
    
    await db.diet_plans.insert_one(plan_dict)
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
    
    query = {"is_active": True}
    
    if role == UserRole.CLIENT.value:
        query["client_id"] = user_id
    elif role == UserRole.TRAINER.value:
        query["trainer_id"] = user_id
    elif client_id and role in [UserRole.ADMIN.value]:
        query["client_id"] = client_id
    
    plans = await db.workout_plans.find(query, {"_id": 0}).to_list(100)
    return plans


@api_router.post("/workout-plans")
async def create_workout_plan(
    plan_data: WorkoutPlanCreate,
    current_user: dict = Depends(require_roles(UserRole.TRAINER, UserRole.ADMIN))
):
    """Create a workout plan"""
    plan = WorkoutPlan(
        **plan_data.model_dump(),
        trainer_id=current_user["user_id"]
    )
    plan_dict = plan.model_dump()
    plan_dict["created_at"] = plan_dict["created_at"].isoformat()
    
    await db.workout_plans.insert_one(plan_dict)
    return {"workout_plan_id": plan.workout_plan_id, "message": "Workout plan created"}


# ============ ASSESSMENTS & TREATMENT ============

@api_router.post("/assessments")
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: dict = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN))
):
    """Create an assessment"""
    assessment = Assessment(
        **assessment_data.model_dump(),
        staff_id=current_user["user_id"]
    )
    assessment_dict = assessment.model_dump()
    assessment_dict["created_at"] = assessment_dict["created_at"].isoformat()
    
    await db.assessments.insert_one(assessment_dict)
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
        {"client_id": client_id}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return assessments


@api_router.post("/treatment-plans")
async def create_treatment_plan(
    plan_data: TreatmentPlanCreate,
    current_user: dict = Depends(require_roles(UserRole.PHYSIOTHERAPIST, UserRole.ADMIN))
):
    """Create a treatment plan"""
    plan = TreatmentPlan(
        **plan_data.model_dump(),
        staff_id=current_user["user_id"]
    )
    plan_dict = plan.model_dump()
    plan_dict["created_at"] = plan_dict["created_at"].isoformat()
    
    await db.treatment_plans.insert_one(plan_dict)
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
        {"client_id": client_id, "is_active": True}, 
        {"_id": 0}
    ).to_list(100)
    return plans


# ============ PROGRESS TRACKING ============

@api_router.post("/progress")
async def record_progress(
    client_id: str,
    metric_type: str,
    value: float,
    unit: str,
    notes: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Record a progress metric"""
    role = current_user["role"]
    
    # Clients can record their own, staff can record for assigned clients
    if role == UserRole.CLIENT.value and current_user["user_id"] != client_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    metric = ProgressMetric(
        client_id=client_id,
        recorded_by=current_user["user_id"],
        metric_type=metric_type,
        value=value,
        unit=unit,
        notes=notes
    )
    metric_dict = metric.model_dump()
    metric_dict["recorded_at"] = metric_dict["recorded_at"].isoformat()
    
    await db.progress_metrics.insert_one(metric_dict)
    return {"metric_id": metric.metric_id, "message": "Progress recorded"}


@api_router.get("/progress/{client_id}")
async def get_progress(
    client_id: str,
    metric_type: Optional[str] = None,
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
    return metrics


# ============ BILLING & PAYMENTS ============

@api_router.post("/invoices")
async def create_invoice(
    invoice_data: InvoiceCreate,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Create an invoice"""
    subtotal = sum(item.total for item in invoice_data.items)
    tax = subtotal * 0.18  # 18% GST
    total = subtotal + tax
    
    invoice = Invoice(
        client_id=invoice_data.client_id,
        items=[item.model_dump() for item in invoice_data.items],
        subtotal=subtotal,
        tax=tax,
        total=total,
        notes=invoice_data.notes
    )
    invoice_dict = invoice.model_dump()
    invoice_dict["created_at"] = invoice_dict["created_at"].isoformat()
    
    await db.invoices.insert_one(invoice_dict)
    return {"invoice_id": invoice.invoice_id, "total": total}


@api_router.get("/invoices")
async def get_invoices(
    client_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get invoices"""
    role = current_user["role"]
    
    query = {}
    if role == UserRole.CLIENT.value:
        query["client_id"] = current_user["user_id"]
    elif client_id:
        query["client_id"] = client_id
    
    if status:
        query["status"] = status
    
    invoices = await db.invoices.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return invoices


# ============ WEBSITE CONTENT ============

@api_router.get("/testimonials")
async def get_testimonials():
    """Get visible testimonials (public)"""
    testimonials = await db.testimonials.find(
        {"is_visible": True}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    return testimonials


@api_router.post("/testimonials")
async def create_testimonial(
    client_name: str,
    content: str,
    rating: int = 5,
    current_user: dict = Depends(require_roles(UserRole.ADMIN))
):
    """Create a testimonial (Admin only)"""
    testimonial = Testimonial(
        client_name=client_name,
        content=content,
        rating=rating
    )
    testimonial_dict = testimonial.model_dump()
    testimonial_dict["created_at"] = testimonial_dict["created_at"].isoformat()
    
    await db.testimonials.insert_one(testimonial_dict)
    return {"testimonial_id": testimonial.testimonial_id}


@api_router.get("/faqs")
async def get_faqs(category: Optional[str] = None):
    """Get FAQs (public)"""
    query = {"is_visible": True}
    if category:
        query["category"] = category
    
    faqs = await db.faqs.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return faqs


@api_router.get("/gallery")
async def get_gallery(category: Optional[str] = None):
    """Get gallery images (public)"""
    query = {"is_visible": True}
    if category:
        query["category"] = category
    
    images = await db.gallery.find(query, {"_id": 0}).sort("order", 1).to_list(50)
    return images


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
        {"$set": {"is_read": True}}
    )
    return {"message": "Notification marked as read"}


# ============ DASHBOARD STATS ============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics based on role"""
    role = current_user["role"]
    user_id = current_user["user_id"]
    stats = {}
    
    if role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]:
        # Admin/Reception stats
        stats["total_clients"] = await db.users.count_documents({"role": UserRole.CLIENT.value})
        stats["pending_bookings"] = await db.guest_bookings.count_documents({"status": "pending"})
        stats["today_appointments"] = await db.appointments.count_documents({
            "scheduled_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
        })
        stats["active_memberships"] = await db.memberships.count_documents({"is_active": True})
    
    elif role == UserRole.CLIENT.value:
        # Client stats
        stats["upcoming_appointments"] = await db.appointments.count_documents({
            "client_id": user_id,
            "status": {"$in": ["pending", "confirmed"]}
        })
        stats["active_plans"] = await db.treatment_plans.count_documents({
            "client_id": user_id,
            "is_active": True
        })
    
    elif role == UserRole.PHYSIOTHERAPIST.value:
        stats["assigned_patients"] = await db.appointments.distinct(
            "client_id",
            {"staff_id": user_id}
        )
        stats["assigned_patients"] = len(stats["assigned_patients"])
        stats["today_sessions"] = await db.appointments.count_documents({
            "staff_id": user_id,
            "scheduled_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
        })
    
    elif role == UserRole.TRAINER.value:
        stats["assigned_members"] = await db.workout_plans.distinct(
            "client_id",
            {"trainer_id": user_id, "is_active": True}
        )
        stats["assigned_members"] = len(stats["assigned_members"])
    
    elif role == UserRole.NUTRITIONIST.value:
        stats["assigned_clients"] = await db.diet_plans.distinct(
            "client_id",
            {"nutritionist_id": user_id, "is_active": True}
        )
        stats["assigned_clients"] = len(stats["assigned_clients"])
    
    return stats


# ============ CLIENTS LIST (Admin/Reception) ============

@api_router.get("/clients")
async def get_clients(
    search: Optional[str] = None,
    current_user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.RECEPTION))
):
    """Get all clients"""
    query = {"role": UserRole.CLIENT.value}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    
    clients = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(500)
    return clients


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db():
    """Initialize database with seed data if empty"""
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.appointments.create_index("scheduled_date")
    await db.guest_bookings.create_index("status")
    
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
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "service_id": "svc_paed_therapy",
                "name": "Paediatric Therapy Session",
                "description": "Individual therapy session for children",
                "category": "paediatric_physio",
                "duration_minutes": 45,
                "price": 800,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "service_id": "svc_weight_consult",
                "name": "Weight Management Consultation",
                "description": "Personal consultation for weight management",
                "category": "weight_management",
                "duration_minutes": 45,
                "price": 1000,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "service_id": "svc_pcod_program",
                "name": "PCOD Wellness Program",
                "description": "Specialized program for PCOD management",
                "category": "pcod",
                "duration_minutes": 60,
                "price": 1200,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "service_id": "svc_zumba",
                "name": "Zumba Class",
                "description": "Fun group fitness class",
                "category": "zumba_aerobics_yoga",
                "duration_minutes": 60,
                "price": 500,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "service_id": "svc_yoga",
                "name": "Yoga Session",
                "description": "Guided yoga for flexibility and wellness",
                "category": "zumba_aerobics_yoga",
                "duration_minutes": 60,
                "price": 600,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "service_id": "svc_pain",
                "name": "Pain Management Session",
                "description": "Physiotherapy for pain relief",
                "category": "pain_management",
                "duration_minutes": 45,
                "price": 900,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.services.insert_many(default_services)
        logger.info("Seeded default services")
    
    # Seed default FAQs if none exist
    faqs_count = await db.faqs.count_documents({})
    if faqs_count == 0:
        default_faqs = [
            {
                "faq_id": "faq_1",
                "question": "What age children do you treat?",
                "answer": "We treat children from newborns to 18 years old. Our paediatric physiotherapists are specialized in developmental milestones, neurological conditions, and orthopaedic issues in children.",
                "category": "paediatric",
                "order": 1,
                "is_visible": True
            },
            {
                "faq_id": "faq_2",
                "question": "How does the PCOD program work?",
                "answer": "Our PCOD program is a holistic approach combining guided exercises, nutrition planning, and lifestyle modifications. We track your progress with optional cycle logging (with your consent) to provide personalized recommendations.",
                "category": "women",
                "order": 2,
                "is_visible": True
            },
            {
                "faq_id": "faq_3",
                "question": "Can I book an online consultation?",
                "answer": "Yes! We offer online consultations for follow-ups and initial assessments. You'll receive a secure meeting link via WhatsApp/email before your appointment.",
                "category": "general",
                "order": 3,
                "is_visible": True
            },
            {
                "faq_id": "faq_4",
                "question": "What payment methods do you accept?",
                "answer": "We accept UPI, credit/debit cards, net banking, and cash payments. You can also opt for package memberships with convenient payment plans.",
                "category": "billing",
                "order": 4,
                "is_visible": True
            }
        ]
        await db.faqs.insert_many(default_faqs)
        logger.info("Seeded default FAQs")
    
    # Seed testimonials if none exist
    testimonials_count = await db.testimonials.count_documents({})
    if testimonials_count == 0:
        default_testimonials = [
            {
                "testimonial_id": "test_1",
                "client_name": "Priya M.",
                "content": "My daughter's motor skills have improved tremendously after just 3 months of therapy. The therapists are so patient and caring with children.",
                "rating": 5,
                "is_visible": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "testimonial_id": "test_2",
                "client_name": "Anita S.",
                "content": "The PCOD program has been life-changing. I've lost 8 kgs and my symptoms have reduced significantly. The nutritionist and trainer work so well together!",
                "rating": 5,
                "is_visible": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "testimonial_id": "test_3",
                "client_name": "Kavitha R.",
                "content": "I love the Zumba classes! The instructors make it fun and the timing works perfectly with my schedule. Great facilities and very clean.",
                "rating": 5,
                "is_visible": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.testimonials.insert_many(default_testimonials)
        logger.info("Seeded default testimonials")
    
    # Create default admin if none exists
    admin_exists = await db.users.find_one({"role": UserRole.ADMIN.value})
    if not admin_exists:
        admin_user = {
            "user_id": "user_admin001",
            "email": "admin@mazharwellness.com",
            "name": "Admin",
            "role": UserRole.ADMIN.value,
            "password_hash": hash_password("admin123"),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        logger.info("Created default admin user")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
