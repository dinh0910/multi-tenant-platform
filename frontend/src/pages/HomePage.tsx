import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import PostCard from '../components/PostCard';
import { postsApi } from '../api/posts';
import type { PostListItem } from '../types/post';
import { useTenant } from '../contexts/TenantContext';

export default function HomePage() {
  const { tenant } = useTenant();
  const siteName = tenant?.seo_defaults?.site_name ?? 'Blog Platform';
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi.list({ page: 1, page_size: 6 })
      .then((d) => setPosts(d.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEOHead
        description={`Welcome to ${siteName} — discover insightful articles and stories.`}
        type="website"
      />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <p className="hero__subtitle">Welcome to</p>
          <h1 className="hero__title">{siteName}</h1>
          <p className="hero__desc">
            Discover insightful articles, tutorials, and stories crafted to inspire and inform.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/blog" className="btn btn-primary">Explore All Posts →</Link>
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Latest Articles</h2>
            <div className="section__line" />
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <p>No posts published yet.</p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}

          {posts.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/blog" className="btn btn-ghost">View All Articles →</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
