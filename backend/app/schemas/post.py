import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator

from app.models.post import PostStatus
from app.schemas.user import UserPublic
from app.schemas.category import CategoryResponse
from app.schemas.tag import TagResponse


class PostBase(BaseModel):
    title: str
    content: str = ""
    thumbnail: str | None = None
    status: PostStatus = PostStatus.DRAFT
    meta_title: str | None = None
    meta_description: str | None = None
    keywords: str | None = None


class PostCreate(PostBase):
    slug: str | None = None  # auto-generated if not provided
    category_ids: list[uuid.UUID] = []
    tag_ids: list[uuid.UUID] = []


class PostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    content: str | None = None
    thumbnail: str | None = None
    status: PostStatus | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    keywords: str | None = None
    category_ids: list[uuid.UUID] | None = None
    tag_ids: list[uuid.UUID] | None = None


class PostResponse(PostBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    slug: str
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    author: UserPublic | None = None
    categories: list[CategoryResponse] = []
    tags: list[TagResponse] = []


class PostListItem(BaseModel):
    """Lightweight post for list views"""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    thumbnail: str | None
    status: PostStatus
    meta_description: str | None
    published_at: datetime | None
    created_at: datetime
    author: UserPublic | None = None
    categories: list[CategoryResponse] = []
    tags: list[TagResponse] = []


class PaginatedPosts(BaseModel):
    items: list[PostListItem]
    total: int
    page: int
    page_size: int
    pages: int
