"""
Authentication and Authorization helpers
With RBAC enforcement and audit logging
"""
import os
import jwt
import bcrypt
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Callable
from functools import wraps
from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer
from models import UserRole, AuditAction, AuditLog


# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "mazhar-wellness-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_jwt_token(user_id: str, email: str, role: str) -> str:
    """Create a JWT token for a user"""
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


async def get_current_user(request: Request, credentials=Depends(security)) -> dict:
    """Get current user from JWT token (cookie or header)"""
    token = None
    
    # Try to get token from cookie first
    session_token = request.cookies.get("session_token")
    if session_token:
        token = session_token
    # Then try Authorization header
    elif credentials:
        token = credentials.credentials
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    payload = decode_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Add request info for audit logging
    payload["_request_ip"] = request.client.host if request.client else None
    payload["_request_user_agent"] = request.headers.get("user-agent")
    
    return payload


async def get_optional_user(request: Request, credentials=Depends(security)) -> Optional[dict]:
    """Get current user if authenticated, None otherwise"""
    try:
        return await get_current_user(request, credentials)
    except HTTPException:
        return None


def require_roles(*roles: UserRole):
    """Dependency to require specific roles - SERVER-SIDE ENFORCEMENT"""
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        role_values = [r.value if isinstance(r, UserRole) else r for r in roles]
        
        if user_role not in role_values:
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied. Required roles: {role_values}, your role: {user_role}"
            )
        return current_user
    return role_checker


def require_any_staff():
    """Require any staff role (not client)"""
    return require_roles(
        UserRole.ADMIN, 
        UserRole.RECEPTION, 
        UserRole.PHYSIOTHERAPIST, 
        UserRole.TRAINER, 
        UserRole.NUTRITIONIST
    )


# ============ PERMISSION CHECKERS ============

class Permissions:
    """Centralized permission checking"""
    
    @staticmethod
    def can_access_finance(role: str) -> bool:
        """Check if role can access finance features"""
        return role == UserRole.ADMIN.value
    
    @staticmethod
    def can_manage_staff(role: str) -> bool:
        """Check if role can manage staff"""
        return role == UserRole.ADMIN.value
    
    @staticmethod
    def can_delete_records(role: str) -> bool:
        """Check if role can delete records - ADMIN ONLY"""
        return role == UserRole.ADMIN.value
    
    @staticmethod
    def can_change_pricing(role: str) -> bool:
        """Check if role can change pricing - ADMIN ONLY"""
        return role == UserRole.ADMIN.value
    
    @staticmethod
    def can_view_all_clients(role: str) -> bool:
        """Check if role can view all clients"""
        return role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]
    
    @staticmethod
    def can_manage_appointments(role: str) -> bool:
        """Check if role can manage all appointments"""
        return role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]
    
    @staticmethod
    def can_access_physio_notes(role: str) -> bool:
        """Check if role can access physio treatment notes"""
        return role in [UserRole.ADMIN.value, UserRole.PHYSIOTHERAPIST.value]
    
    @staticmethod
    def can_manage_exercise_library(role: str) -> bool:
        """Check if role can add/edit exercises"""
        return role in [UserRole.ADMIN.value, UserRole.PHYSIOTHERAPIST.value, UserRole.TRAINER.value]
    
    @staticmethod
    def can_view_exercise_library(role: str) -> bool:
        """Check if role can view exercise library"""
        return role in [
            UserRole.ADMIN.value, 
            UserRole.PHYSIOTHERAPIST.value, 
            UserRole.TRAINER.value,
            UserRole.NUTRITIONIST.value
        ]
    
    @staticmethod
    def can_create_diet_plans(role: str) -> bool:
        """Check if role can create diet plans"""
        return role in [UserRole.ADMIN.value, UserRole.NUTRITIONIST.value]
    
    @staticmethod
    def can_create_workout_plans(role: str) -> bool:
        """Check if role can create workout plans"""
        return role in [UserRole.ADMIN.value, UserRole.TRAINER.value]
    
    @staticmethod
    def can_create_assessments(role: str) -> bool:
        """Check if role can create assessments"""
        return role in [UserRole.ADMIN.value, UserRole.PHYSIOTHERAPIST.value]
    
    @staticmethod
    def can_create_treatment_plans(role: str) -> bool:
        """Check if role can create treatment plans"""
        return role in [UserRole.ADMIN.value, UserRole.PHYSIOTHERAPIST.value]
    
    @staticmethod
    def can_view_audit_logs(role: str) -> bool:
        """Check if role can view audit logs - ADMIN ONLY"""
        return role == UserRole.ADMIN.value
    
    @staticmethod
    def can_manage_website_content(role: str) -> bool:
        """Check if role can manage website content"""
        return role == UserRole.ADMIN.value
    
    @staticmethod
    def can_manage_notification_templates(role: str) -> bool:
        """Check if role can manage notification templates"""
        return role == UserRole.ADMIN.value
    
    @staticmethod
    def can_convert_guest_to_client(role: str) -> bool:
        """Check if role can convert guest booking to client"""
        return role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]
    
    @staticmethod
    def can_collect_payments(role: str) -> bool:
        """Check if role can collect payments"""
        return role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]
    
    @staticmethod
    def can_issue_refunds(role: str) -> bool:
        """Check if role can issue refunds - ADMIN ONLY"""
        return role == UserRole.ADMIN.value
    
    @staticmethod
    def can_lock_medical_records(role: str) -> bool:
        """Check if role can lock medical records"""
        return role in [UserRole.ADMIN.value, UserRole.PHYSIOTHERAPIST.value]
    
    @staticmethod
    def can_send_notifications(role: str) -> bool:
        """Check if role can send broadcast notifications"""
        return role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]
    
    @staticmethod
    def can_export_reports(role: str) -> bool:
        """Check if role can export reports"""
        return role in [
            UserRole.ADMIN.value, 
            UserRole.RECEPTION.value,
            UserRole.PHYSIOTHERAPIST.value,
            UserRole.TRAINER.value,
            UserRole.NUTRITIONIST.value
        ]


# ============ CLIENT ACCESS HELPERS ============

def get_accessible_client_ids(role: str, user_id: str, db_session) -> Optional[List[str]]:
    """
    Get list of client IDs the user can access.
    Returns None if user can access all clients.
    """
    if role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]:
        return None  # Can access all
    
    # For staff roles, they can only access assigned clients
    # This would be populated from client_profiles where assigned_physio/trainer/nutritionist = user_id
    return []  # Will be populated by actual query


# ============ AUDIT LOGGING ============

async def create_audit_log(
    db,
    user: dict,
    action: AuditAction,
    entity_type: str,
    entity_id: str,
    old_value: Optional[dict] = None,
    new_value: Optional[dict] = None
):
    """Create an immutable audit log entry"""
    log = AuditLog(
        user_id=user.get("user_id", "system"),
        user_email=user.get("email", "system@internal"),
        user_role=user.get("role", "system"),
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_value=old_value,
        new_value=new_value,
        ip_address=user.get("_request_ip"),
        user_agent=user.get("_request_user_agent")
    )
    
    log_dict = log.model_dump()
    log_dict["created_at"] = log_dict["created_at"].isoformat()
    
    await db.audit_logs.insert_one(log_dict)
    return log


# ============ SOFT DELETE HELPERS ============

async def soft_delete(db, collection: str, id_field: str, id_value: str, user: dict):
    """Perform soft delete on a record"""
    if not Permissions.can_delete_records(user.get("role")):
        raise HTTPException(status_code=403, detail="You don't have permission to delete records")
    
    # Get current record for audit
    record = await db[collection].find_one({id_field: id_value}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    if record.get("deleted_at"):
        raise HTTPException(status_code=400, detail="Record already deleted")
    
    # Perform soft delete
    result = await db[collection].update_one(
        {id_field: id_value},
        {"$set": {
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "deleted_by": user.get("user_id")
        }}
    )
    
    # Create audit log
    await create_audit_log(
        db, user, AuditAction.DELETE, collection, id_value,
        old_value={"deleted_at": None},
        new_value={"deleted_at": datetime.now(timezone.utc).isoformat()}
    )
    
    return result.modified_count > 0


def exclude_deleted(query: dict = None) -> dict:
    """Add filter to exclude soft-deleted records"""
    if query is None:
        query = {}
    query["deleted_at"] = None
    return query


# ============ RECORD LOCKING HELPERS ============

async def lock_medical_record(db, collection: str, id_field: str, id_value: str, user: dict):
    """Lock a medical record to make it immutable"""
    if not Permissions.can_lock_medical_records(user.get("role")):
        raise HTTPException(status_code=403, detail="You don't have permission to lock records")
    
    record = await db[collection].find_one({id_field: id_value}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    if record.get("is_locked"):
        raise HTTPException(status_code=400, detail="Record is already locked")
    
    result = await db[collection].update_one(
        {id_field: id_value},
        {"$set": {
            "is_locked": True,
            "locked_at": datetime.now(timezone.utc).isoformat(),
            "locked_by": user.get("user_id")
        }}
    )
    
    # Create audit log
    await create_audit_log(
        db, user, AuditAction.LOCK, collection, id_value,
        old_value={"is_locked": False},
        new_value={"is_locked": True}
    )
    
    return result.modified_count > 0


def check_record_editable(record: dict, user: dict, allow_same_day: bool = True):
    """Check if a record can be edited"""
    if record.get("is_locked"):
        raise HTTPException(status_code=400, detail="This record is locked and cannot be edited")
    
    if allow_same_day:
        # Check if created today (same-day edit window)
        created_at = record.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        now = datetime.now(timezone.utc)
        if created_at.date() != now.date():
            raise HTTPException(
                status_code=400, 
                detail="This record can only be edited on the same day it was created"
            )


# ============ STAFF ASSIGNMENT HELPERS ============

async def get_assigned_clients(db, staff_id: str, role: str) -> List[str]:
    """Get list of client IDs assigned to a staff member"""
    field_map = {
        UserRole.PHYSIOTHERAPIST.value: "assigned_physio",
        UserRole.TRAINER.value: "assigned_trainer",
        UserRole.NUTRITIONIST.value: "assigned_nutritionist"
    }
    
    field = field_map.get(role)
    if not field:
        return []
    
    profiles = await db.client_profiles.find(
        {field: staff_id},
        {"_id": 0, "user_id": 1}
    ).to_list(1000)
    
    return [p["user_id"] for p in profiles]


async def verify_client_access(db, user: dict, client_id: str):
    """Verify user has access to a specific client"""
    role = user.get("role")
    user_id = user.get("user_id")
    
    # Admin and Reception can access all
    if role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]:
        return True
    
    # Client can only access themselves
    if role == UserRole.CLIENT.value:
        if user_id != client_id:
            raise HTTPException(status_code=403, detail="You can only access your own records")
        return True
    
    # Staff can only access assigned clients
    assigned_clients = await get_assigned_clients(db, user_id, role)
    if client_id not in assigned_clients:
        raise HTTPException(status_code=403, detail="You don't have access to this client's records")
    
    return True
