import uuid
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise credentials_exception
        user_id = uuid.UUID(payload["sub"])
    except (ValueError, KeyError):
        raise credentials_exception

    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise credentials_exception

    return user


async def get_current_tenant_admin(
    current_user: User = Depends(get_current_user),
    request: Request = None,
) -> User:
    if current_user.role == UserRole.SUPER_ADMIN:
        return current_user

    if current_user.role not in (UserRole.TENANT_ADMIN, UserRole.AUTHOR):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant admin access required")

    tenant = getattr(request.state, "tenant", None)
    if tenant and current_user.tenant_id != tenant.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied for this tenant")

    return current_user


async def require_tenant_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role not in (UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant admin privileges required")
    return current_user


async def require_super_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin privileges required")
    return current_user
