import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.dependencies import get_current_user, require_tenant_admin
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.post import PostCreate, PostUpdate, PostResponse, PostListItem, PaginatedPosts
from app.services.post_service import PostService
from app.repositories.post_repository import PostRepository

router = APIRouter(prefix="/posts", tags=["posts"])


def get_tenant(request: Request) -> Tenant:
    tenant = getattr(request.state, "tenant", None)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant not found for this domain")
    return tenant


# ─── Public endpoints ────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedPosts)
async def list_posts(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    category_id: uuid.UUID | None = None,
    tag_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    tenant = get_tenant(request)
    service = PostService(db)
    posts, total, pages = await service.get_posts_paginated(
        tenant.id,
        page=page,
        page_size=page_size,
        published_only=True,
        category_id=category_id,
        tag_id=tag_id,
    )
    return PaginatedPosts(items=posts, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/{slug}", response_model=PostResponse)
async def get_post_by_slug(
    slug: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    tenant = get_tenant(request)
    repo = PostRepository(db)
    post = await repo.get_by_slug(tenant.id, slug)
    if not post or post.status.value != "published":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


# ─── Admin endpoints ──────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=PaginatedPosts)
async def admin_list_posts(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_tenant_admin),
):
    tenant = get_tenant(request)
    service = PostService(db)
    posts, total, pages = await service.get_posts_paginated(
        tenant.id, page=page, page_size=page_size, published_only=False
    )
    return PaginatedPosts(items=posts, total=total, page=page, page_size=page_size, pages=pages)


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    data: PostCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_tenant_admin),
):
    tenant = get_tenant(request)
    service = PostService(db)
    post = await service.create_post(tenant.id, current_user.id, data)
    return post


@router.patch("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: uuid.UUID,
    data: PostUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_tenant_admin),
):
    tenant = get_tenant(request)
    service = PostService(db)
    post = await service.update_post(tenant.id, post_id, data)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_tenant_admin),
):
    tenant = get_tenant(request)
    from app.repositories.post_repository import PostRepository
    repo = PostRepository(db)
    post = await repo.get(post_id)
    if not post or post.tenant_id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    await repo.delete(post)
