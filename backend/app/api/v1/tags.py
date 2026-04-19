import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from slugify import slugify

from app.core.database import get_db
from app.auth.dependencies import require_tenant_admin
from app.models.user import User
from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate, TagResponse
from app.repositories.base import BaseRepository

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[TagResponse])
async def list_tags(request: Request, db: AsyncSession = Depends(get_db)):
    tenant = getattr(request.state, "tenant", None)
    if not tenant:
        raise HTTPException(status_code=400, detail="Tenant not found")
    repo = BaseRepository(Tag, db)
    items, _ = await repo.get_all(filters=[Tag.tenant_id == tenant.id], limit=500)
    return items


@router.post("", response_model=TagResponse, status_code=201)
async def create_tag(
    data: TagCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_tenant_admin),
):
    tenant = getattr(request.state, "tenant", None)
    if not tenant:
        raise HTTPException(status_code=400, detail="Tenant not found")
    slug = data.slug or slugify(data.name)
    tag = Tag(tenant_id=tenant.id, name=data.name, slug=slug)
    repo = BaseRepository(Tag, db)
    return await repo.create(tag)


@router.delete("/{tag_id}", status_code=204)
async def delete_tag(
    tag_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_tenant_admin),
):
    tenant = getattr(request.state, "tenant", None)
    repo = BaseRepository(Tag, db)
    tag = await repo.get(tag_id)
    if not tag or tag.tenant_id != tenant.id:
        raise HTTPException(status_code=404, detail="Tag not found")
    await repo.delete(tag)
