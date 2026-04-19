from datetime import datetime, timezone
from fastapi import APIRouter, Request, Response
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.post import Post, PostStatus
from app.models.category import Category
from app.models.tag import Tag

router = APIRouter(tags=["seo"])


@router.get("/robots.txt", response_class=Response)
async def robots_txt(request: Request):
    tenant = getattr(request.state, "tenant", None)
    host = request.headers.get("host", "localhost")
    scheme = request.url.scheme

    if tenant and tenant.seo_defaults.get("robots_disallow_all"):
        content = "User-agent: *\nDisallow: /\n"
    else:
        content = (
            f"User-agent: *\n"
            f"Allow: /\n"
            f"Disallow: /admin/\n"
            f"Sitemap: {scheme}://{host}/sitemap.xml\n"
        )
    return Response(content=content, media_type="text/plain")


@router.get("/sitemap.xml", response_class=Response)
async def sitemap_xml(request: Request):
    tenant = getattr(request.state, "tenant", None)
    host = request.headers.get("host", "localhost")
    scheme = request.url.scheme
    base_url = f"{scheme}://{host}"

    urls: list[str] = [
        _url_entry(base_url + "/", "daily", "1.0"),
        _url_entry(base_url + "/blog", "daily", "0.9"),
    ]

    if tenant:
        async with AsyncSessionLocal() as db:
            # Posts
            result = await db.execute(
                select(Post).where(
                    Post.tenant_id == tenant.id, Post.status == PostStatus.PUBLISHED
                ).order_by(Post.updated_at.desc())
            )
            for post in result.scalars().all():
                lastmod = (post.updated_at or post.published_at).strftime("%Y-%m-%d")
                urls.append(_url_entry(f"{base_url}/blog/{post.slug}", "weekly", "0.8", lastmod))

            # Categories
            result = await db.execute(
                select(Category).where(Category.tenant_id == tenant.id)
            )
            for cat in result.scalars().all():
                urls.append(_url_entry(f"{base_url}/category/{cat.slug}", "weekly", "0.6"))

            # Tags
            result = await db.execute(
                select(Tag).where(Tag.tenant_id == tenant.id)
            )
            for tag in result.scalars().all():
                urls.append(_url_entry(f"{base_url}/tag/{tag.slug}", "monthly", "0.5"))

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += "".join(urls)
    xml += "</urlset>"

    return Response(content=xml, media_type="application/xml")


def _url_entry(loc: str, changefreq: str, priority: str, lastmod: str | None = None) -> str:
    entry = f"  <url>\n    <loc>{loc}</loc>\n"
    if lastmod:
        entry += f"    <lastmod>{lastmod}</lastmod>\n"
    entry += f"    <changefreq>{changefreq}</changefreq>\n"
    entry += f"    <priority>{priority}</priority>\n"
    entry += "  </url>\n"
    return entry
