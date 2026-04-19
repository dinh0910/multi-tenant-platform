import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TenantBase(BaseModel):
    name: str
    domain: str
    logo: str | None = None
    theme_config: dict = {}
    seo_defaults: dict = {}


class TenantCreate(TenantBase):
    pass


class TenantUpdate(BaseModel):
    name: str | None = None
    logo: str | None = None
    theme_config: dict | None = None
    seo_defaults: dict | None = None
    is_active: bool | None = None


class TenantResponse(TenantBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
