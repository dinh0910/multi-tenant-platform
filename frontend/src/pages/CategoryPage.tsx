import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { postsApi } from '../api/posts';
import { adminApi } from '../api/admin';
import type { PaginatedPosts, Category } from '../types/post';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [data, setData] = useState<PaginatedPosts | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listCategories().then((cats) => {
      const cat = cats.find((c) => c.slug === slug);
      setCategory(cat ?? null);
      if (cat) {
        postsApi.list({ page, page_size: 9, category_id: cat.id })
          .then(setData)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, [slug, page]);

  return (
    <>
      <SEOHead
        title={category ? `Category: ${category.name}` : 'Category'}
        description={category?.description ?? `Posts in category ${slug}`}
      />

      <section style={{ padding: '3rem 0 1rem' }}>
        <div className="container">
          <nav style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            <Link to="/">Home</Link> / <Link to="/blog">Blog</Link> / <span>{category?.name ?? slug}</span>
          </nav>
          <h1>Category: {category?.name ?? slug}</h1>
          {category?.description && <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>{category.description}</p>}
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : !data || data.items.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon">📭</div><p>No posts in this category.</p></div>
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
