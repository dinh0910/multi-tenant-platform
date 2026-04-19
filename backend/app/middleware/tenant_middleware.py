from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.database import AsyncSessionLocal
from app.repositories.tenant_repository import TenantRepository


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Resolves the current tenant from the Host request header.
    Injects `request.state.tenant` for use in route handlers.
    Bypasses tenant resolution for super-admin and health endpoints.
    """

    BYPASS_PATHS = {"/health", "/docs", "/redoc", "/openapi.json"}

    async def dispatch(self, request: Request, call_next):
        # Skip tenant resolution for specific paths
        if request.url.path in self.BYPASS_PATHS or request.url.path.startswith("/admin/tenants"):
            request.state.tenant = None
            return await call_next(request)

        host = request.headers.get("host", "").split(":")[0].lower()

        async with AsyncSessionLocal() as session:
            repo = TenantRepository(session)
            tenant = await repo.get_by_domain(host)

        if tenant is None:
            # Allow requests without a tenant for super-admin operations
            request.state.tenant = None
        else:
            request.state.tenant = tenant

        return await call_next(request)
