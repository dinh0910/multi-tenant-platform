import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TagBase(BaseModel):
    name: str
    slug: str | None = None


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    name: str | None = None


class TagResponse(TagBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    slug: str
    created_at: datetime
