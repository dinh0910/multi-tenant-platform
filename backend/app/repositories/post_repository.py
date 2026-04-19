import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.post import Post, PostStatus
from app.repositories.base import BaseRepository


class PostRepository(BaseRepository[Post]):
    def __init__(self, session: AsyncSession):
        super().__init__(Post, session)

    async def get_with_relations(self, id: uuid.UUID) -> Post | None:
        result = await self.session.execute(
            select(Post)
            .where(Post.id == id)
            .options(
                selectinload(Post.author),
                selectinload(Post.categories),
                selectinload(Post.tags),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_slug(self, tenant_id: uuid.UUID, slug: str) -> Post | None:
        result = await self.session.execute(
            select(Post)
            .where(Post.tenant_id == tenant_id, Post.slug == slug)
            .options(
                selectinload(Post.author),
                selectinload(Post.categories),
                selectinload(Post.tags),
            )
        )
        return result.scalar_one_or_none()

    async def get_published_by_tenant(
        self,
        tenant_id: uuid.UUID,
        *,
        skip: int = 0,
        limit: int = 10,
        category_id: uuid.UUID | None = None,
        tag_id: uuid.UUID | None = None,
    ) -> tuple[list[Post], int]:
        from sqlalchemy import func
        from app.models.associations import PostCategory, PostTag

        query = (
            select(Post)
            .where(Post.tenant_id == tenant_id, Post.status == PostStatus.PUBLISHED)
            .options(
                selectinload(Post.author),
                selectinload(Post.categories),
                selectinload(Post.tags),
            )
            .order_by(Post.published_at.desc())
        )
        count_query = (
            select(func.count())
            .select_from(Post)
            .where(Post.tenant_id == tenant_id, Post.status == PostStatus.PUBLISHED)
        )

        if category_id:
            query = query.join(PostCategory, Post.id == PostCategory.post_id).where(
                PostCategory.category_id == category_id
            )
            count_query = count_query.join(PostCategory, Post.id == PostCategory.post_id).where(
                PostCategory.category_id == category_id
            )

        if tag_id:
            query = query.join(PostTag, Post.id == PostTag.post_id).where(
                PostTag.tag_id == tag_id
            )
            count_query = count_query.join(PostTag, Post.id == PostTag.post_id).where(
                PostTag.tag_id == tag_id
            )

        total = (await self.session.execute(count_query)).scalar_one()
        posts = list((await self.session.execute(query.offset(skip).limit(limit))).scalars().all())
        return posts, total
