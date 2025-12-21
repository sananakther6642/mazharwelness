"""
Mazhar Wellness & Paediatric Physio - Database Models
"""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime, timezone
from enum import Enum
import uuid


def generate_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:12]}"


class UserRole(str, Enum):
    ADMIN = "admin"
    RECEPTION = "reception"
    PHYSIOTHERAPIST = "physiotherapist"
    TRAINER = "trainer"
    NUTRITIONIST = "nutritionist"
    CLIENT = "client"


class ClientType(str, Enum):
    PARENT = "parent"  # Paediatric
    WOMAN = "woman"    # Women's Wellness


class ServiceCategory(str, Enum):
    PAEDIATRIC_PHYSIO = "paediatric_physio"
    WEIGHT_MANAGEMENT = "weight_management"
    PCOD = "pcod"
    ZUMBA_AEROBICS_YOGA = "zumba_aerobics_yoga"
    PAIN_MANAGEMENT = "pain_management"


class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


# ============ USER & AUTH MODELS ============

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CLIENT
    is_active: bool = True
    picture: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.CLIENT


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    user_id: str = Field(default_factory=lambda: generate_id("user_"))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str = Field(default_factory=lambda: generate_id("sess_"))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ CLIENT PROFILE MODELS ============

class ClientProfileBase(BaseModel):
    client_type: ClientType
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None
    preferred_batch: Optional[str] = None
    medical_conditions: Optional[str] = None
    emergency_contact: Optional[str] = None


class ParentProfile(ClientProfileBase):
    client_type: ClientType = ClientType.PARENT
    child_name: str
    child_age: int
    child_condition: Optional[str] = None


class WomanProfile(ClientProfileBase):
    client_type: ClientType = ClientType.WOMAN
    age: int
    pcod_tracking: bool = False


class ClientProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    profile_id: str = Field(default_factory=lambda: generate_id("profile_"))
    user_id: str
    client_type: ClientType
    # Parent fields
    child_name: Optional[str] = None
    child_age: Optional[int] = None
    child_condition: Optional[str] = None
    # Woman fields
    age: Optional[int] = None
    pcod_tracking: bool = False
    # Common fields
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None
    preferred_batch: Optional[str] = None
    medical_conditions: Optional[str] = None
    emergency_contact: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ STAFF PROFILE MODEL ============

class StaffProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    staff_id: str = Field(default_factory=lambda: generate_id("staff_"))
    user_id: str
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    available_days: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ SERVICE & PACKAGE MODELS ============

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: ServiceCategory
    duration_minutes: int = 60
    price: float
    is_active: bool = True


class Service(ServiceBase):
    model_config = ConfigDict(extra="ignore")
    service_id: str = Field(default_factory=lambda: generate_id("svc_"))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PackageBase(BaseModel):
    name: str
    description: Optional[str] = None
    services: List[str] = []  # service_ids
    sessions_count: int = 10
    validity_days: int = 30
    price: float
    is_active: bool = True


class Package(PackageBase):
    model_config = ConfigDict(extra="ignore")
    package_id: str = Field(default_factory=lambda: generate_id("pkg_"))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ GUEST BOOKING MODEL ============

class GuestBookingCreate(BaseModel):
    full_name: str
    phone: str
    service_category: ServiceCategory
    preferred_date: str
    preferred_time: str
    message: Optional[str] = None


class GuestBooking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    booking_id: str = Field(default_factory=lambda: generate_id("guest_"))
    full_name: str
    phone: str
    service_category: ServiceCategory
    preferred_date: str
    preferred_time: str
    message: Optional[str] = None
    status: str = "pending"  # pending, contacted, converted, cancelled
    assigned_to: Optional[str] = None  # staff user_id
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ APPOINTMENT MODEL ============

class AppointmentCreate(BaseModel):
    client_id: str
    service_id: str
    staff_id: str
    scheduled_date: str
    scheduled_time: str
    duration_minutes: int = 60
    notes: Optional[str] = None
    meeting_link: Optional[str] = None
    is_online: bool = False


class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    appointment_id: str = Field(default_factory=lambda: generate_id("apt_"))
    client_id: str
    service_id: str
    staff_id: str
    scheduled_date: str
    scheduled_time: str
    duration_minutes: int = 60
    status: AppointmentStatus = AppointmentStatus.PENDING
    notes: Optional[str] = None
    meeting_link: Optional[str] = None
    is_online: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ MEMBERSHIP & ENROLLMENT ============

class MembershipCreate(BaseModel):
    client_id: str
    package_id: str
    start_date: str
    payment_id: Optional[str] = None


class Membership(BaseModel):
    model_config = ConfigDict(extra="ignore")
    membership_id: str = Field(default_factory=lambda: generate_id("mem_"))
    client_id: str
    package_id: str
    start_date: str
    end_date: str
    sessions_remaining: int
    is_active: bool = True
    payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ BILLING & PAYMENT MODELS ============

class InvoiceItem(BaseModel):
    description: str
    quantity: int = 1
    unit_price: float
    total: float


class InvoiceCreate(BaseModel):
    client_id: str
    items: List[InvoiceItem]
    notes: Optional[str] = None


class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    invoice_id: str = Field(default_factory=lambda: generate_id("inv_"))
    client_id: str
    items: List[InvoiceItem]
    subtotal: float
    tax: float = 0
    total: float
    status: PaymentStatus = PaymentStatus.PENDING
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaymentCreate(BaseModel):
    invoice_id: str
    amount: float
    payment_method: str = "razorpay"


class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    payment_id: str = Field(default_factory=lambda: generate_id("pay_"))
    invoice_id: str
    client_id: str
    amount: float
    payment_method: str
    status: PaymentStatus = PaymentStatus.PENDING
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ ASSESSMENT & TREATMENT MODELS ============

class AssessmentCreate(BaseModel):
    client_id: str
    assessment_type: str  # milestones, strength, ROM, gait, posture, pain
    findings: dict
    recommendations: Optional[str] = None


class Assessment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    assessment_id: str = Field(default_factory=lambda: generate_id("assess_"))
    client_id: str
    staff_id: str
    assessment_type: str
    findings: dict
    recommendations: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TreatmentPlanCreate(BaseModel):
    client_id: str
    diagnosis: str
    goals: List[str]
    interventions: List[str]
    frequency: str
    duration_weeks: int


class TreatmentPlan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    plan_id: str = Field(default_factory=lambda: generate_id("plan_"))
    client_id: str
    staff_id: str
    diagnosis: str
    goals: List[str]
    interventions: List[str]
    frequency: str
    duration_weeks: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DailyNote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    note_id: str = Field(default_factory=lambda: generate_id("note_"))
    client_id: str
    staff_id: str
    appointment_id: Optional[str] = None
    subjective: str
    objective: str
    assessment: str
    plan: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ EXERCISE LIBRARY MODELS ============

class ExerciseCreate(BaseModel):
    name: str
    description: str
    category: str
    instructions: List[str]
    sets: Optional[int] = None
    reps: Optional[int] = None
    duration_seconds: Optional[int] = None
    frequency: Optional[str] = None
    contraindications: List[str] = []
    age_suitability: str = "all"
    video_url: Optional[str] = None
    image_url: Optional[str] = None


class Exercise(ExerciseCreate):
    model_config = ConfigDict(extra="ignore")
    exercise_id: str = Field(default_factory=lambda: generate_id("ex_"))
    created_by: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ExerciseAssignment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    assignment_id: str = Field(default_factory=lambda: generate_id("assign_"))
    client_id: str
    exercise_id: str
    assigned_by: str
    sets: int
    reps: int
    frequency: str
    notes: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ DIET PLAN MODELS ============

class MealPlan(BaseModel):
    time: str
    meal_type: str  # breakfast, lunch, dinner, snack
    items: List[str]
    calories: Optional[int] = None
    notes: Optional[str] = None


class DietPlanCreate(BaseModel):
    client_id: str
    plan_type: str  # pcod, weight_loss, balanced, vegetarian, etc.
    meals: List[MealPlan]
    daily_calories: Optional[int] = None
    notes: Optional[str] = None


class DietPlan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    diet_plan_id: str = Field(default_factory=lambda: generate_id("diet_"))
    client_id: str
    nutritionist_id: str
    plan_type: str
    meals: List[MealPlan]
    daily_calories: Optional[int] = None
    notes: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ WORKOUT PLAN MODELS ============

class WorkoutExercise(BaseModel):
    exercise_id: str
    exercise_name: str
    sets: int
    reps: int
    duration_seconds: Optional[int] = None
    rest_seconds: int = 60
    notes: Optional[str] = None


class WorkoutPlanCreate(BaseModel):
    client_id: str
    name: str
    exercises: List[WorkoutExercise]
    frequency: str
    pcod_safe: bool = False
    notes: Optional[str] = None


class WorkoutPlan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    workout_plan_id: str = Field(default_factory=lambda: generate_id("workout_"))
    client_id: str
    trainer_id: str
    name: str
    exercises: List[WorkoutExercise]
    frequency: str
    pcod_safe: bool = False
    notes: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ PROGRESS TRACKING ============

class ProgressMetric(BaseModel):
    model_config = ConfigDict(extra="ignore")
    metric_id: str = Field(default_factory=lambda: generate_id("metric_"))
    client_id: str
    recorded_by: str
    metric_type: str  # weight, bmi, pain_level, strength, flexibility
    value: float
    unit: str
    notes: Optional[str] = None
    recorded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ ATTENDANCE ============

class AttendanceLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    attendance_id: str = Field(default_factory=lambda: generate_id("att_"))
    client_id: str
    appointment_id: Optional[str] = None
    class_id: Optional[str] = None
    check_in: datetime
    check_out: Optional[datetime] = None
    recorded_by: str


# ============ COMMUNICATION ============

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message_id: str = Field(default_factory=lambda: generate_id("msg_"))
    sender_id: str
    receiver_id: str
    content: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    notification_id: str = Field(default_factory=lambda: generate_id("notif_"))
    user_id: str
    title: str
    message: str
    notification_type: str  # appointment, payment, reminder, system
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ WEBSITE CONTENT ============

class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    testimonial_id: str = Field(default_factory=lambda: generate_id("test_"))
    client_name: str
    content: str
    rating: int = 5
    is_visible: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FAQ(BaseModel):
    model_config = ConfigDict(extra="ignore")
    faq_id: str = Field(default_factory=lambda: generate_id("faq_"))
    question: str
    answer: str
    category: str
    order: int = 0
    is_visible: bool = True


class GalleryImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    image_id: str = Field(default_factory=lambda: generate_id("img_"))
    url: str
    caption: Optional[str] = None
    category: str
    is_visible: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
