import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from slugify import slugify

from app.core.database import get_db
from app.auth.dependencies import require_tenant_admin
from app.models.user import User
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.repositories.base import BaseRepository

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
async def list_categories(request: Request, db: AsyncSession = Depends(get_db)):
    tenant = getattr(request.state, "tenant", None)
    if not tenant:
        raise HTTPException(status_code=400, detail="Tenant not found")
    repo = BaseRepository(Category, db)
    items, _ = await repo.get_all(filters=[Category.tenant_id == tenant.id], limit=200)
    return items


@router.post("", response_model=CategoryResponse, status_code=201)
async def create_category(
    data: CategoryCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_tenant_admin),
):
    tenant = getattr(request.state, "tenant", None)
    if not tenant:
        raise HTTPException(status_code=400, detail="Tenant not found")
    slug = data.slug or slugify(data.name)
    cat = Category(tenant_id=tenant.id, name=data.name, slug=slug, description=data.description)
    repo = BaseRepository(Category, db)
    return await repo.create(cat)


@router.patch("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    data: CategoryUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_tenant_admin),
):
    tenant = getattr(request.state, "tenant", None)
    repo = BaseRepository(Category, db)
    cat = await repo.get(category_id)
    if not cat or cat.tenant_id != tenant.id:
        raise HTTPException(status_code=404, detail="Category not found")
    return await repo.update(cat, data.model_dump(exclude_none=True))


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_tenant_admin),
):
    tenant = getattr(request.state, "tenant", None)
    repo = BaseRepository(Category, db)
    cat = await repo.get(category_id)
    if not cat or cat.tenant_id != tenant.id:
        raise HTTPException(status_code=404, detail="Category not found")
    await repo.delete(cat)
