import uuid
from typing import Any, Generic, TypeVar

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get(self, id: uuid.UUID) -> ModelType | None:
        return await self.session.get(self.model, id)

    async def get_all(
        self,
        *,
        filters: list[Any] | None = None,
        skip: int = 0,
        limit: int = 20,
        order_by: Any | None = None,
    ) -> tuple[list[ModelType], int]:
        query = select(self.model)
        count_query = select(func.count()).select_from(self.model)

        if filters:
            for f in filters:
                query = query.where(f)
                count_query = count_query.where(f)

        if order_by is not None:
            query = query.order_by(order_by)

        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        result = await self.session.execute(query.offset(skip).limit(limit))
        items = list(result.scalars().all())

        return items, total

    async def create(self, obj: ModelType) -> ModelType:
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def update(self, obj: ModelType, data: dict[str, Any]) -> ModelType:
        for key, value in data.items():
            if value is not None:
                setattr(obj, key, value)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def delete(self, obj: ModelType) -> None:
        await self.session.delete(obj)
        await self.session.flush()
