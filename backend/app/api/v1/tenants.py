import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.dependencies import require_super_admin
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantUpdate, TenantResponse
from app.repositories.base import BaseRepository

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("", response_model=list[TenantResponse])
async def list_tenants(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    repo = BaseRepository(Tenant, db)
    items, _ = await repo.get_all(limit=100)
    return items


@router.post("", response_model=TenantResponse, status_code=201)
async def create_tenant(
    data: TenantCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    tenant = Tenant(**data.model_dump())
    repo = BaseRepository(Tenant, db)
    return await repo.create(tenant)


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    repo = BaseRepository(Tenant, db)
    tenant = await repo.get(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.patch("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: uuid.UUID,
    data: TenantUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    repo = BaseRepository(Tenant, db)
    tenant = await repo.get(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return await repo.update(tenant, data.model_dump(exclude_none=True))


@router.delete("/{tenant_id}", status_code=204)
async def delete_tenant(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    repo = BaseRepository(Tenant, db)
    tenant = await repo.get(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    await repo.delete(tenant)
