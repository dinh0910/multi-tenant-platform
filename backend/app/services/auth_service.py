from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from sqlalchemy import select


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def authenticate(self, email: str, password: str) -> User | None:
        result = await self.session.execute(select(User).where(User.email == email, User.is_active == True))
        user = result.scalar_one_or_none()
        
        if not user:
            return None
            
        is_valid = verify_password(password, user.hashed_password)
        if not is_valid:
            return None
            
        return user

    def create_tokens(self, user: User) -> dict:
        payload = {
            "sub": str(user.id),
            "tenant_id": str(user.tenant_id) if user.tenant_id else None,
            "role": user.role.value,
        }
        return {
            "access_token": create_access_token(payload),
            "refresh_token": create_refresh_token(payload),
            "token_type": "bearer",
        }

    async def refresh_tokens(self, refresh_token: str) -> dict | None:
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                return None
        except ValueError:
            return None

        import uuid
        user_id = uuid.UUID(payload["sub"])
        user = await self.session.get(User, user_id)
        if not user or not user.is_active:
            return None

        return self.create_tokens(user)
