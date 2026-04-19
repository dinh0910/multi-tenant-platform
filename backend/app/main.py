from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.middleware.tenant_middleware import TenantMiddleware
from app.auth.router import router as auth_router
from app.api.v1 import posts, categories, tags, users, tenants, seo

app = FastAPI(
    title="Multi-Tenant Blog Platform",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Tenant detection ──────────────────────────────────────────────────────────
app.add_middleware(TenantMiddleware)

# ── Static file uploads ───────────────────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
API_V1 = "/api/v1"

app.include_router(auth_router, prefix=API_V1)
app.include_router(posts.router, prefix=API_V1)
app.include_router(categories.router, prefix=API_V1)
app.include_router(tags.router, prefix=API_V1)
app.include_router(users.router, prefix=API_V1)
app.include_router(tenants.router, prefix=API_V1)

# SEO routes (no /api prefix — served at domain root)
app.include_router(seo.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
