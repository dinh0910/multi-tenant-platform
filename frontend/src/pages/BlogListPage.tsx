import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { postsApi } from '../api/posts';
import type { PaginatedPosts } from '../types/post';

export default function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? 1);
  const [data, setData] = useState<PaginatedPosts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    postsApi.list({ page, page_size: 9 })
      .then(setData)
      .finally(() => setLoading(false));
  }, [page]);

  const handlePageChange = (p: number) => {
    setSearchParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEOHead
        title="Blog"
        description="Browse all articles — find the latest insights, tutorials, and stories."
      />

      <section style={{ padding: '3rem 0 1rem' }}>
        <div className="container">
          <h1>All Articles</h1>
          {data && (
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              {data.total} article{data.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : !data || data.items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <p>No articles found.</p>
            </div>
          ) : (
            <>
              <div className="posts-grid">
                {data.items.map((p) => <PostCard key={p.id} post={p} />)}
              </div>
              <Pagination
                page={data.page}
                pages={data.pages}
                total={data.total}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
