import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models.user import UserRole


class UserBase(BaseModel):
    email: str
    full_name: str
    role: UserRole = UserRole.AUTHOR
    avatar: str | None = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID | None
    is_active: bool
    created_at: datetime


class UserPublic(BaseModel):
    """Safe user info for public post display"""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    avatar: str | None
