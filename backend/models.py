"""
Mazhar Wellness & Paediatric Physio - Complete Database Models
With soft delete, audit logging, and all constraints
"""
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, timezone
from enum import Enum
import uuid


def generate_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:12]}"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ============ ENUMS ============

class UserRole(str, Enum):
    ADMIN = "admin"
    RECEPTION = "reception"
    PHYSIOTHERAPIST = "physiotherapist"
    TRAINER = "trainer"
    NUTRITIONIST = "nutritionist"
    CLIENT = "client"


class ClientType(str, Enum):
    PARENT = "parent"
    WOMAN = "woman"


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


class GuestBookingStatus(str, Enum):
    PENDING = "pending"
    CONTACTED = "contacted"
    CONVERTED = "converted"
    CANCELLED = "cancelled"


class NotificationType(str, Enum):
    APPOINTMENT = "appointment"
    PAYMENT = "payment"
    REMINDER = "reminder"
    SYSTEM = "system"
    MESSAGE = "message"


class AuditAction(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    VIEW = "view"
    EXPORT = "export"
    LOCK = "lock"


class AssessmentType(str, Enum):
    DEVELOPMENTAL_MILESTONES = "developmental_milestones"
    STRENGTH = "strength"
    ROM = "rom"
    GAIT = "gait"
    POSTURE = "posture"
    PAIN = "pain"
    CUSTOM = "custom"


class ExerciseCategory(str, Enum):
    STRENGTH = "strength"
    FLEXIBILITY = "flexibility"
    BALANCE = "balance"
    CARDIO = "cardio"
    COORDINATION = "coordination"
    BREATHING = "breathing"
    RELAXATION = "relaxation"
    FUNCTIONAL = "functional"


class DietPlanType(str, Enum):
    PCOD = "pcod"
    WEIGHT_LOSS = "weight_loss"
    BALANCED = "balanced"
    VEGETARIAN = "vegetarian"
    HIGH_PROTEIN = "high_protein"
    POSTPARTUM = "postpartum"
    KIDS = "kids"
    ANTI_INFLAMMATORY = "anti_inflammatory"


class MetricType(str, Enum):
    WEIGHT = "weight"
    BMI = "bmi"
    PAIN_LEVEL = "pain_level"
    STRENGTH = "strength"
    FLEXIBILITY = "flexibility"
    ROM = "rom"
    CYCLE_DAY = "cycle_day"


# ============ BASE MODELS WITH SOFT DELETE ============

class SoftDeleteMixin(BaseModel):
    """Mixin for soft delete functionality"""
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[str] = None
    
    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None


class TimestampMixin(BaseModel):
    """Mixin for created/updated timestamps"""
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


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


class OTPRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp: str


class User(UserBase, TimestampMixin, SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    user_id: str = Field(default_factory=lambda: generate_id("user_"))


class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str = Field(default_factory=lambda: generate_id("sess_"))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=utc_now)


# ============ CLIENT PROFILE MODELS ============

class ClientProfileBase(BaseModel):
    client_type: ClientType
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None
    preferred_batch: Optional[str] = None
    medical_conditions: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None


class ParentProfileCreate(ClientProfileBase):
    client_type: ClientType = ClientType.PARENT
    child_name: str
    child_age: int
    child_condition: Optional[str] = None
    child_dob: Optional[str] = None


class WomanProfileCreate(ClientProfileBase):
    client_type: ClientType = ClientType.WOMAN
    age: int
    pcod_tracking: bool = False
    cycle_tracking_consent: bool = False


class ClientProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    profile_id: str = Field(default_factory=lambda: generate_id("profile_"))
    user_id: str
    client_type: ClientType
    # Parent fields
    child_name: Optional[str] = None
    child_age: Optional[int] = None
    child_condition: Optional[str] = None
    child_dob: Optional[str] = None
    # Woman fields
    age: Optional[int] = None
    pcod_tracking: bool = False
    cycle_tracking_consent: bool = False
    # Common fields
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None
    preferred_batch: Optional[str] = None
    medical_conditions: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    # Assigned staff
    assigned_physio: Optional[str] = None
    assigned_trainer: Optional[str] = None
    assigned_nutritionist: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


# ============ STAFF PROFILE MODEL ============

class StaffProfileCreate(BaseModel):
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    available_days: List[str] = []
    available_hours: Optional[Dict[str, List[str]]] = None


class StaffProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    staff_id: str = Field(default_factory=lambda: generate_id("staff_"))
    user_id: str
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    available_days: List[str] = []
    available_hours: Optional[Dict[str, List[str]]] = None
    created_at: datetime = Field(default_factory=utc_now)


# ============ SERVICE & PACKAGE MODELS ============

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: ServiceCategory
    duration_minutes: int = 60
    price: float
    is_active: bool = True


class Service(ServiceBase, SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    service_id: str = Field(default_factory=lambda: generate_id("svc_"))
    created_at: datetime = Field(default_factory=utc_now)
    created_by: Optional[str] = None


class PackageBase(BaseModel):
    name: str
    description: Optional[str] = None
    services: List[str] = []
    sessions_count: int = 10
    validity_days: int = 30
    price: float
    is_active: bool = True


class Package(PackageBase, SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    package_id: str = Field(default_factory=lambda: generate_id("pkg_"))
    created_at: datetime = Field(default_factory=utc_now)
    created_by: Optional[str] = None


# ============ GUEST BOOKING MODEL ============

class GuestBookingCreate(BaseModel):
    full_name: str
    phone: str
    service_category: ServiceCategory
    preferred_date: str
    preferred_time: str
    message: Optional[str] = None


class GuestBookingConvert(BaseModel):
    """Convert guest booking to client"""
    email: EmailStr
    password: Optional[str] = None  # Optional if using OTP
    client_type: ClientType
    # Parent fields
    child_name: Optional[str] = None
    child_age: Optional[int] = None
    # Woman fields
    age: Optional[int] = None
    # Assignment
    assign_staff_id: Optional[str] = None
    # Optional immediate appointment
    schedule_appointment: Optional[Dict[str, Any]] = None


class GuestBooking(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    booking_id: str = Field(default_factory=lambda: generate_id("guest_"))
    full_name: str
    phone: str
    service_category: ServiceCategory
    preferred_date: str
    preferred_time: str
    message: Optional[str] = None
    status: GuestBookingStatus = GuestBookingStatus.PENDING
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    converted_to_user_id: Optional[str] = None
    converted_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)


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


class Appointment(SoftDeleteMixin):
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
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    created_by: Optional[str] = None


# ============ MEMBERSHIP & ENROLLMENT ============

class MembershipCreate(BaseModel):
    client_id: str
    package_id: str
    start_date: str
    payment_id: Optional[str] = None


class Membership(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    membership_id: str = Field(default_factory=lambda: generate_id("mem_"))
    client_id: str
    package_id: str
    start_date: str
    end_date: str
    sessions_total: int
    sessions_used: int = 0
    sessions_remaining: int
    is_active: bool = True
    payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    renewal_alert_sent: bool = False


# ============ BILLING & PAYMENT MODELS ============

class InvoiceItem(BaseModel):
    description: str
    quantity: int = 1
    unit_price: float
    total: float
    service_id: Optional[str] = None
    package_id: Optional[str] = None


class InvoiceCreate(BaseModel):
    client_id: str
    items: List[InvoiceItem]
    notes: Optional[str] = None
    appointment_id: Optional[str] = None
    membership_id: Optional[str] = None


class Invoice(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    invoice_id: str = Field(default_factory=lambda: generate_id("inv_"))
    invoice_number: str = Field(default_factory=lambda: f"INV-{utc_now().strftime('%Y%m%d')}-{generate_id('')[:6].upper()}")
    client_id: str
    items: List[Dict[str, Any]]
    subtotal: float
    tax: float = 0
    tax_rate: float = 0.18  # 18% GST
    total: float
    status: PaymentStatus = PaymentStatus.PENDING
    notes: Optional[str] = None
    appointment_id: Optional[str] = None
    membership_id: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    created_by: Optional[str] = None


class PaymentCreate(BaseModel):
    invoice_id: str
    amount: float
    payment_method: str = "razorpay"
    mock_mode: bool = False


class Payment(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    payment_id: str = Field(default_factory=lambda: generate_id("pay_"))
    invoice_id: str
    client_id: str
    amount: float
    payment_method: str
    status: PaymentStatus = PaymentStatus.PENDING
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    mock_mode: bool = False
    receipt_url: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)


class Receipt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    receipt_id: str = Field(default_factory=lambda: generate_id("rcpt_"))
    receipt_number: str = Field(default_factory=lambda: f"RCPT-{utc_now().strftime('%Y%m%d')}-{generate_id('')[:6].upper()}")
    payment_id: str
    invoice_id: str
    client_id: str
    amount: float
    payment_method: str
    pdf_url: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)


# ============ ASSESSMENT & TREATMENT MODELS ============

class AssessmentCreate(BaseModel):
    client_id: str
    assessment_type: AssessmentType
    findings: Dict[str, Any]
    recommendations: Optional[str] = None


class Assessment(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    assessment_id: str = Field(default_factory=lambda: generate_id("assess_"))
    client_id: str
    staff_id: str
    assessment_type: AssessmentType
    findings: Dict[str, Any]
    recommendations: Optional[str] = None
    is_locked: bool = False
    locked_at: Optional[datetime] = None
    locked_by: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class TreatmentPlanCreate(BaseModel):
    client_id: str
    diagnosis: str
    goals: List[str]
    interventions: List[str]
    frequency: str
    duration_weeks: int
    precautions: Optional[List[str]] = None


class TreatmentPlan(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    plan_id: str = Field(default_factory=lambda: generate_id("plan_"))
    client_id: str
    staff_id: str
    diagnosis: str
    goals: List[str]
    interventions: List[str]
    frequency: str
    duration_weeks: int
    precautions: List[str] = []
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: bool = True
    is_locked: bool = False
    locked_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class DailyNoteCreate(BaseModel):
    client_id: str
    appointment_id: Optional[str] = None
    subjective: str
    objective: str
    assessment: str
    plan: str


class DailyNote(SoftDeleteMixin):
    """SOAP notes - immutable after lock"""
    model_config = ConfigDict(extra="ignore")
    note_id: str = Field(default_factory=lambda: generate_id("note_"))
    client_id: str
    staff_id: str
    appointment_id: Optional[str] = None
    subjective: str  # S - Patient's complaint
    objective: str   # O - Observations/measurements
    assessment: str  # A - Clinical assessment
    plan: str        # P - Treatment plan
    is_locked: bool = False
    locked_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


# ============ EXERCISE LIBRARY MODELS ============

class ExerciseCreate(BaseModel):
    name: str
    description: str
    category: ExerciseCategory
    instructions: List[str]
    contraindications: List[str]  # MANDATORY
    pcod_safe: bool = True
    min_age: int = 0
    max_age: int = 100
    sets: Optional[int] = None
    reps: Optional[int] = None
    duration_seconds: Optional[int] = None
    frequency: Optional[str] = None
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    pdf_url: Optional[str] = None
    
    @field_validator('contraindications')
    @classmethod
    def contraindications_required(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one contraindication must be specified (use "None" if no contraindications)')
        return v


class Exercise(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    exercise_id: str = Field(default_factory=lambda: generate_id("ex_"))
    name: str
    description: str
    category: ExerciseCategory
    instructions: List[str]
    contraindications: List[str]
    pcod_safe: bool = True
    min_age: int = 0
    max_age: int = 100
    sets: Optional[int] = None
    reps: Optional[int] = None
    duration_seconds: Optional[int] = None
    frequency: Optional[str] = None
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    pdf_url: Optional[str] = None
    created_by: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=utc_now)


class ExerciseAssignmentCreate(BaseModel):
    client_id: str
    exercise_id: str
    sets: int
    reps: int
    frequency: str
    notes: Optional[str] = None


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
    created_at: datetime = Field(default_factory=utc_now)


class ExerciseTemplate(BaseModel):
    """Reusable exercise routine template"""
    model_config = ConfigDict(extra="ignore")
    template_id: str = Field(default_factory=lambda: generate_id("extpl_"))
    name: str
    description: Optional[str] = None
    category: str
    exercises: List[Dict[str, Any]]  # exercise_id, sets, reps, order
    pcod_safe: bool = True
    min_age: int = 0
    max_age: int = 100
    created_by: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=utc_now)


# ============ DIET PLAN MODELS ============

class MealItem(BaseModel):
    name: str
    portion: str
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None


class MealPlan(BaseModel):
    time: str
    meal_type: str  # breakfast, mid_morning, lunch, evening, dinner
    items: List[MealItem]
    total_calories: Optional[int] = None
    notes: Optional[str] = None


class DietPlanCreate(BaseModel):
    client_id: str
    plan_type: DietPlanType
    meals: List[MealPlan]
    daily_calories: Optional[int] = None
    water_intake_liters: Optional[float] = None
    restrictions: Optional[List[str]] = None
    supplements: Optional[List[str]] = None
    notes: Optional[str] = None


class DietPlan(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    diet_plan_id: str = Field(default_factory=lambda: generate_id("diet_"))
    client_id: str
    nutritionist_id: str
    plan_type: DietPlanType
    meals: List[Dict[str, Any]]
    daily_calories: Optional[int] = None
    water_intake_liters: Optional[float] = None
    restrictions: List[str] = []
    supplements: List[str] = []
    notes: Optional[str] = None
    is_active: bool = True
    pdf_url: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class DietTemplate(BaseModel):
    """Reusable diet plan template"""
    model_config = ConfigDict(extra="ignore")
    template_id: str = Field(default_factory=lambda: generate_id("diettpl_"))
    name: str
    plan_type: DietPlanType
    meals: List[Dict[str, Any]]
    daily_calories: Optional[int] = None
    description: Optional[str] = None
    created_by: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=utc_now)


# ============ WORKOUT PLAN MODELS ============

class WorkoutExercise(BaseModel):
    exercise_id: str
    exercise_name: str
    sets: int
    reps: int
    duration_seconds: Optional[int] = None
    rest_seconds: int = 60
    order: int = 0
    notes: Optional[str] = None


class WorkoutPlanCreate(BaseModel):
    client_id: str
    name: str
    exercises: List[WorkoutExercise]
    frequency: str
    pcod_safe: bool = False
    notes: Optional[str] = None


class WorkoutPlan(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    workout_plan_id: str = Field(default_factory=lambda: generate_id("workout_"))
    client_id: str
    trainer_id: str
    name: str
    exercises: List[Dict[str, Any]]
    frequency: str
    pcod_safe: bool = False
    notes: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


# ============ PROGRESS TRACKING ============

class ProgressMetricCreate(BaseModel):
    client_id: str
    metric_type: MetricType
    value: float
    unit: str
    notes: Optional[str] = None


class ProgressMetric(BaseModel):
    model_config = ConfigDict(extra="ignore")
    metric_id: str = Field(default_factory=lambda: generate_id("metric_"))
    client_id: str
    recorded_by: str
    metric_type: MetricType
    value: float
    unit: str
    notes: Optional[str] = None
    recorded_at: datetime = Field(default_factory=utc_now)


class PCODCycleLog(BaseModel):
    """Optional PCOD cycle tracking with consent"""
    model_config = ConfigDict(extra="ignore")
    log_id: str = Field(default_factory=lambda: generate_id("cycle_"))
    client_id: str
    cycle_day: int
    period_start: Optional[str] = None
    symptoms: List[str] = []
    mood: Optional[str] = None
    notes: Optional[str] = None
    recorded_at: datetime = Field(default_factory=utc_now)


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
    notes: Optional[str] = None


# ============ COMMUNICATION ============

class MessageAttachment(BaseModel):
    file_url: str
    file_name: str
    file_type: str
    file_size: int


class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message_id: str = Field(default_factory=lambda: generate_id("msg_"))
    conversation_id: str
    sender_id: str
    receiver_id: str
    content: str
    attachments: List[MessageAttachment] = []
    is_read: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)


class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    conversation_id: str = Field(default_factory=lambda: generate_id("conv_"))
    participants: List[str]  # user_ids
    last_message_at: datetime = Field(default_factory=utc_now)
    created_at: datetime = Field(default_factory=utc_now)


class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    notification_id: str = Field(default_factory=lambda: generate_id("notif_"))
    user_id: str
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool = False
    read_at: Optional[datetime] = None
    action_url: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)


class NotificationTemplate(BaseModel):
    """Templates for SMS/WhatsApp/Email notifications"""
    model_config = ConfigDict(extra="ignore")
    template_id: str = Field(default_factory=lambda: generate_id("ntpl_"))
    name: str
    channel: str  # sms, whatsapp, email, in_app
    subject: Optional[str] = None  # For email
    content: str
    variables: List[str] = []  # {{client_name}}, {{date}}, etc.
    is_active: bool = True
    created_at: datetime = Field(default_factory=utc_now)


# ============ ONLINE CONSULTATION ============

class ConsultationMessage(BaseModel):
    sender_id: str
    content: str
    timestamp: datetime = Field(default_factory=utc_now)


class ConsultationFile(BaseModel):
    uploaded_by: str
    file_url: str
    file_name: str
    file_type: str
    uploaded_at: datetime = Field(default_factory=utc_now)


class Consultation(BaseModel):
    """Online consultation session"""
    model_config = ConfigDict(extra="ignore")
    consultation_id: str = Field(default_factory=lambda: generate_id("consult_"))
    appointment_id: str
    client_id: str
    staff_id: str
    meeting_link: Optional[str] = None
    meeting_platform: Optional[str] = None  # zoom, google_meet
    chat_messages: List[Dict[str, Any]] = []
    shared_files: List[Dict[str, Any]] = []
    session_notes: Optional[str] = None
    summary: Optional[str] = None
    follow_up_date: Optional[str] = None
    summary_pdf_url: Optional[str] = None
    status: str = "scheduled"  # scheduled, in_progress, completed
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)


# ============ DOCUMENT UPLOADS ============

class UploadedDocument(BaseModel):
    model_config = ConfigDict(extra="ignore")
    document_id: str = Field(default_factory=lambda: generate_id("doc_"))
    client_id: str
    uploaded_by: str
    file_type: str
    file_url: str
    file_name: str
    file_size: int
    description: Optional[str] = None
    category: str  # medical_report, prescription, consent_form, progress_photo, food_log
    is_visible_to_client: bool = True
    created_at: datetime = Field(default_factory=utc_now)


# ============ WEBSITE CONTENT ============

class Testimonial(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    testimonial_id: str = Field(default_factory=lambda: generate_id("test_"))
    client_name: str
    client_id: Optional[str] = None  # Link to actual client if consented
    content: str
    rating: int = 5
    service_category: Optional[ServiceCategory] = None
    is_visible: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=utc_now)


class FAQ(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    faq_id: str = Field(default_factory=lambda: generate_id("faq_"))
    question: str
    answer: str
    category: str
    order: int = 0
    is_visible: bool = True


class GalleryImage(SoftDeleteMixin):
    model_config = ConfigDict(extra="ignore")
    image_id: str = Field(default_factory=lambda: generate_id("img_"))
    url: str
    thumbnail_url: Optional[str] = None
    caption: Optional[str] = None
    category: str
    is_visible: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=utc_now)


# ============ AUDIT LOG ============

class AuditLog(BaseModel):
    """Immutable audit log for compliance"""
    model_config = ConfigDict(extra="ignore")
    log_id: str = Field(default_factory=lambda: generate_id("audit_"))
    user_id: str
    user_email: str
    user_role: str
    action: AuditAction
    entity_type: str  # user, appointment, payment, assessment, etc.
    entity_id: str
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)


# ============ SYSTEM SETTINGS ============

class SystemSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    setting_id: str = "settings_main"
    clinic_name: str = "Mazhar Wellness & Paediatric Physio"
    clinic_phone: str = "+919999999999"
    clinic_email: str = "hello@mazharwellness.com"
    clinic_address: str = "123 Wellness Street, Mumbai 400001"
    tax_rate: float = 0.18
    currency: str = "INR"
    timezone: str = "Asia/Kolkata"
    working_hours: Dict[str, Any] = {
        "monday": {"open": "07:00", "close": "20:00"},
        "tuesday": {"open": "07:00", "close": "20:00"},
        "wednesday": {"open": "07:00", "close": "20:00"},
        "thursday": {"open": "07:00", "close": "20:00"},
        "friday": {"open": "07:00", "close": "20:00"},
        "saturday": {"open": "07:00", "close": "20:00"},
        "sunday": {"open": "08:00", "close": "13:00"}
    }
    slot_duration_minutes: int = 30
    razorpay_enabled: bool = True
    razorpay_mock_mode: bool = True
    sms_enabled: bool = False
    whatsapp_enabled: bool = False
    email_enabled: bool = False
    google_oauth_enabled: bool = True
    updated_at: datetime = Field(default_factory=utc_now)
    updated_by: Optional[str] = None
