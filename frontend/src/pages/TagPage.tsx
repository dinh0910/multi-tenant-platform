import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { postsApi } from '../api/posts';
import { adminApi } from '../api/admin';
import type { PaginatedPosts, Tag } from '../types/post';

export default function TagPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tag, setTag] = useState<Tag | null>(null);
  const [data, setData] = useState<PaginatedPosts | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listTags().then((tags) => {
      const found = tags.find((t) => t.slug === slug);
      setTag(found ?? null);
      if (found) {
        postsApi.list({ page, page_size: 9, tag_id: found.id })
          .then(setData)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, [slug, page]);

  return (
    <>
      <SEOHead title={tag ? `Tag: ${tag.name}` : 'Tag'} description={`Posts tagged with #${slug}`} />

      <section style={{ padding: '3rem 0 1rem' }}>
        <div className="container">
          <nav style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            <Link to="/">Home</Link> / <Link to="/blog">Blog</Link> / <span>#{tag?.name ?? slug}</span>
          </nav>
          <h1>Tag: #{tag?.name ?? slug}</h1>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : !data || data.items.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon">🏷️</div><p>No posts with this tag.</p></div>
          ) : (
            <>
              <div className="posts-grid">
                {data.items.map((p) => <PostCard key={p.id} post={p} />)}
              </div>
              <Pagination page={page} pages={data.pages} total={data.total} onPageChange={setPage} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
