import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    logo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    theme_config: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    seo_defaults: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    users: Mapped[list["User"]] = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    posts: Mapped[list["Post"]] = relationship("Post", back_populates="tenant", cascade="all, delete-orphan")
    categories: Mapped[list["Category"]] = relationship("Category", back_populates="tenant", cascade="all, delete-orphan")
    tags: Mapped[list["Tag"]] = relationship("Tag", back_populates="tenant", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Tenant {self.domain}>"
