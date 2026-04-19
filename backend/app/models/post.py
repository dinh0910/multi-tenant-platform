import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, Enum, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
import enum


class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (
        UniqueConstraint("tenant_id", "slug", name="uq_posts_tenant_slug"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    thumbnail: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[PostStatus] = mapped_column(
        Enum(PostStatus, name="post_status"), nullable=False, default=PostStatus.DRAFT, index=True
    )
    # SEO
    meta_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    keywords: Mapped[str | None] = mapped_column(String(500), nullable=True)

    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="posts")
    author: Mapped["User | None"] = relationship("User", back_populates="posts")
    categories: Mapped[list["Category"]] = relationship(
        "Category", secondary="post_categories", back_populates="posts"
    )
    tags: Mapped[list["Tag"]] = relationship(
        "Tag", secondary="post_tags", back_populates="posts"
    )

    def __repr__(self) -> str:
        return f"<Post {self.slug} [{self.status}]>"
