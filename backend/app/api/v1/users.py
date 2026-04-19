import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.dependencies import require_tenant_admin, require_super_admin, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.repositories.base import BaseRepository
from app.core.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("", response_model=list[UserResponse])
async def list_users(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_tenant_admin),
):
    tenant = getattr(request.state, "tenant", None)
    if not tenant:
        raise HTTPException(status_code=400, detail="Tenant not found")
    repo = BaseRepository(User, db)
    items, _ = await repo.get_all(filters=[User.tenant_id == tenant.id], limit=500)
    return items


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(
    data: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_tenant_admin),
):
    tenant = getattr(request.state, "tenant", None)
    if not tenant:
        raise HTTPException(status_code=400, detail="Tenant not found")
    user = User(
        tenant_id=tenant.id,
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
    )
    repo = BaseRepository(User, db)
    return await repo.create(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_tenant_admin),
):
    tenant = getattr(request.state, "tenant", None)
    repo = BaseRepository(User, db)
    user = await repo.get(user_id)
    if not user or user.tenant_id != tenant.id:
        raise HTTPException(status_code=404, detail="User not found")
    return await repo.update(user, data.model_dump(exclude_none=True))


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    repo = BaseRepository(User, db)
    user = await repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await repo.delete(user)
