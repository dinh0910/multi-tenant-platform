# Multi-Tenant Blog Platform

A production-ready, SEO-first blog platform supporting 10–50 independent blog tenants from a single codebase.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI 0.111 + Python 3.12 |
| Frontend | React 18 + TypeScript + Vite |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens) |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Container | Docker Compose |

## Quick Start

### 1. Clone and configure

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
```

### 2. Start with Docker

```bash
docker-compose up -d
```

The database is auto-initialized from `db/schema.sql` and `db/seed.sql`.

### 3. Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## URLs

| Service | URL |
|---|---|
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Frontend | http://localhost:5173 |
| Admin | http://localhost:5173/admin |

## Seed Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@platform.com | Admin@1234 |
| Tenant Admin (Tech Blog) | admin@techblog.localhost | Admin@1234 |

> ⚠️ **Note**: The seed passwords use a pre-hashed bcrypt hash. For production, regenerate all passwords.

## Architecture

```
english-center/
├── backend/
│   ├── app/
│   │   ├── core/          # config, database, security
│   │   ├── models/        # SQLAlchemy models (all with tenant_id)
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── repositories/  # Data access layer
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Tenant detection middleware
│   │   ├── auth/          # JWT dependencies + router
│   │   └── api/v1/        # REST API routes
│   ├── alembic/           # Database migrations
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/           # Axios API clients
│       ├── components/    # Shared components (SEOHead, Layout, etc.)
│       ├── contexts/      # Auth + Tenant React contexts
│       ├── pages/         # Public blog pages
│       ├── pages/admin/   # Admin CMS pages
│       ├── types/         # TypeScript interfaces
│       └── styles/        # CSS (global + admin)
└── db/
    ├── schema.sql         # PostgreSQL DDL
    └── seed.sql           # Dev seed data
```

## Multi-Tenancy

Tenant is resolved from the HTTP `Host` header on every request via `TenantMiddleware`. All database tables include a `tenant_id` foreign key ensuring complete data isolation between tenants.

```
Host: techblog.localhost → Tenant{id, name, theme_config, seo_defaults}
Host: travel.localhost  → Tenant{id, name, theme_config, seo_defaults}
```

## SEO Features

- Dynamic `<title>`, `<meta description>`, `<meta keywords>` per post
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter Cards (summary_large_image)
- Canonical URLs
- JSON-LD Article schema on every blog detail page
- `/sitemap.xml` — auto-generated per tenant (posts + categories + tags)
- `/robots.txt` — points to sitemap, blocks /admin/

## Adding a New Tenant

```bash
# Via API (super admin token required)
curl -X POST http://localhost:8000/api/v1/tenants \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Blog",
    "domain": "myblog.com",
    "theme_config": {"primary_color": "#6366f1"},
    "seo_defaults": {"site_name": "My New Blog"}
  }'
```

## Running Migrations

```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```
"# multi-tenant-platform" 
