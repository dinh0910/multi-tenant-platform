import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from slugify import slugify

from app.models.post import Post, PostStatus
from app.models.category import Category
from app.models.tag import Tag
from app.repositories.post_repository import PostRepository
from app.schemas.post import PostCreate, PostUpdate


class PostService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = PostRepository(session)

    async def _generate_unique_slug(self, tenant_id: uuid.UUID, title: str, base_slug: str | None = None) -> str:
        slug = base_slug or slugify(title)
        original = slug
        counter = 1
        while True:
            existing = await self.repo.get_by_slug(tenant_id, slug)
            if not existing:
                return slug
            slug = f"{original}-{counter}"
            counter += 1

    async def create_post(
        self, tenant_id: uuid.UUID, author_id: uuid.UUID, data: PostCreate
    ) -> Post:
        slug = await self._generate_unique_slug(tenant_id, data.title, data.slug)

        post = Post(
            tenant_id=tenant_id,
            author_id=author_id,
            title=data.title,
            slug=slug,
            content=data.content,
            thumbnail=data.thumbnail,
            status=data.status,
            meta_title=data.meta_title,
            meta_description=data.meta_description,
            keywords=data.keywords,
        )

        if data.status == PostStatus.PUBLISHED:
            post.published_at = datetime.now(timezone.utc)

        # attach categories
        if data.category_ids:
            from sqlalchemy import select
            result = await self.session.execute(
                select(Category).where(
                    Category.id.in_(data.category_ids), Category.tenant_id == tenant_id
                )
            )
            post.categories = list(result.scalars().all())

        # attach tags
        if data.tag_ids:
            from sqlalchemy import select
            result = await self.session.execute(
                select(Tag).where(
                    Tag.id.in_(data.tag_ids), Tag.tenant_id == tenant_id
                )
            )
            post.tags = list(result.scalars().all())

        return await self.repo.create(post)

    async def update_post(
        self, tenant_id: uuid.UUID, post_id: uuid.UUID, data: PostUpdate
    ) -> Post | None:
        post = await self.repo.get_with_relations(post_id)
        if not post or post.tenant_id != tenant_id:
            return None

        update_dict = data.model_dump(exclude_none=True, exclude={"category_ids", "tag_ids", "slug"})

        if data.slug and data.slug != post.slug:
            update_dict["slug"] = await self._generate_unique_slug(tenant_id, post.title, data.slug)

        if data.status == PostStatus.PUBLISHED and post.status == PostStatus.DRAFT:
            update_dict["published_at"] = datetime.now(timezone.utc)

        if data.category_ids is not None:
            from sqlalchemy import select
            result = await self.session.execute(
                select(Category).where(
                    Category.id.in_(data.category_ids), Category.tenant_id == tenant_id
                )
            )
            post.categories = list(result.scalars().all())

        if data.tag_ids is not None:
            from sqlalchemy import select
            result = await self.session.execute(
                select(Tag).where(Tag.id.in_(data.tag_ids), Tag.tenant_id == tenant_id)
            )
            post.tags = list(result.scalars().all())

        return await self.repo.update(post, update_dict)

    async def get_posts_paginated(
        self,
        tenant_id: uuid.UUID,
        *,
        page: int = 1,
        page_size: int = 10,
        published_only: bool = False,
        category_id: uuid.UUID | None = None,
        tag_id: uuid.UUID | None = None,
    ):
        skip = (page - 1) * page_size
        if published_only:
            posts, total = await self.repo.get_published_by_tenant(
                tenant_id, skip=skip, limit=page_size,
                category_id=category_id, tag_id=tag_id,
            )
        else:
            filters = [Post.tenant_id == tenant_id]
            posts, total = await self.repo.get_all(
                filters=filters, skip=skip, limit=page_size,
                order_by=Post.created_at.desc()
            )
        pages = (total + page_size - 1) // page_size
        return posts, total, pages
