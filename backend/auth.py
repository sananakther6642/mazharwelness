"""
Authentication helpers for JWT + Google OAuth
"""
import os
import jwt
import bcrypt
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer
from models import User, UserRole


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
    
    return payload


def require_roles(*roles: UserRole):
    """Dependency to require specific roles"""
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        if user_role not in [r.value for r in roles]:
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied. Required roles: {[r.value for r in roles]}"
            )
        return current_user
    return role_checker


# Role-based permission helpers
def can_access_finance(role: str) -> bool:
    """Check if role can access finance features"""
    return role in [UserRole.ADMIN.value]


def can_manage_staff(role: str) -> bool:
    """Check if role can manage staff"""
    return role in [UserRole.ADMIN.value]


def can_delete_records(role: str) -> bool:
    """Check if role can delete records"""
    return role in [UserRole.ADMIN.value]


def can_change_pricing(role: str) -> bool:
    """Check if role can change pricing"""
    return role in [UserRole.ADMIN.value]


def can_view_all_clients(role: str) -> bool:
    """Check if role can view all clients"""
    return role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]


def can_manage_appointments(role: str) -> bool:
    """Check if role can manage all appointments"""
    return role in [UserRole.ADMIN.value, UserRole.RECEPTION.value]


def can_access_physio_notes(role: str) -> bool:
    """Check if role can access physio treatment notes"""
    return role in [UserRole.ADMIN.value, UserRole.PHYSIOTHERAPIST.value]


def can_manage_exercise_library(role: str) -> bool:
    """Check if role can add/edit exercises"""
    return role in [UserRole.ADMIN.value, UserRole.PHYSIOTHERAPIST.value, UserRole.TRAINER.value]


def can_view_exercise_library(role: str) -> bool:
    """Check if role can view exercise library"""
    return role in [
        UserRole.ADMIN.value, 
        UserRole.PHYSIOTHERAPIST.value, 
        UserRole.TRAINER.value,
        UserRole.NUTRITIONIST.value
    ]
