import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str
    slug: str | None = None
    description: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    slug: str
    created_at: datetime
