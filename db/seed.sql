-- Seed data for development

-- Demo tenant 1
INSERT INTO tenants (id, name, domain, theme_config, seo_defaults) VALUES
(
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Tech Blog',
    'techblog.localhost',
    '{"primary_color": "#6366f1", "font": "Inter"}',
    '{"site_name": "Tech Blog", "twitter_handle": "@techblog"}'
),
(
    'a1b2c3d4-0000-0000-0000-000000000002',
    'Travel Stories',
    'travel.localhost',
    '{"primary_color": "#10b981", "font": "Outfit"}',
    '{"site_name": "Travel Stories", "twitter_handle": "@travelstories"}'
)
ON CONFLICT (domain) DO NOTHING;

-- Super admin user (password: Admin@1234)
INSERT INTO users (id, tenant_id, email, hashed_password, full_name, role) VALUES
(
    'b1b2c3d4-0000-0000-0000-000000000001',
    NULL,
    'superadmin@platform.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqEKtjVAkiHJjuJwRhMI9K2',
    'Super Admin',
    'super_admin'
)
ON CONFLICT DO NOTHING;

-- Tenant admin for Tech Blog (password: Admin@1234)
INSERT INTO users (id, tenant_id, email, hashed_password, full_name, role) VALUES
(
    'b1b2c3d4-0000-0000-0000-000000000002',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'admin@techblog.localhost',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqEKtjVAkiHJjuJwRhMI9K2',
    'Tech Blog Admin',
    'tenant_admin'
)
ON CONFLICT DO NOTHING;
