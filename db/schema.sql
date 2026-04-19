-- ============================================================
-- Multi-Tenant Blog Platform — PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUM TYPES ────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'author');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ── TENANTS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenants (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    domain        VARCHAR(255) NOT NULL UNIQUE,
    logo          VARCHAR(500),
    theme_config  JSONB NOT NULL DEFAULT '{}',
    seo_defaults  JSONB NOT NULL DEFAULT '{}',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);

-- ── USERS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'author',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    avatar          VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_tenant ON users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── POSTS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    author_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    title            VARCHAR(500) NOT NULL,
    slug             VARCHAR(500) NOT NULL,
    content          TEXT NOT NULL DEFAULT '',
    thumbnail        VARCHAR(500),
    status           post_status NOT NULL DEFAULT 'draft',
    meta_title       VARCHAR(255),
    meta_description VARCHAR(500),
    keywords         VARCHAR(500),
    published_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_posts_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_posts_tenant_id  ON posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug        ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status      ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published   ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tenant_status ON posts(tenant_id, status);

-- ── CATEGORIES ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_categories_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON categories(tenant_id);

-- ── TAGS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tags (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tags_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_tags_tenant_id ON tags(tenant_id);

-- ── ASSOCIATIONS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS post_categories (
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- ── UPDATED_AT TRIGGER ────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
