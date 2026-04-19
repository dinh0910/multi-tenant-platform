import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { format } from 'date-fns';
import SEOHead from '../components/SEOHead';
import { postsApi } from '../api/posts';
import type { Post } from '../types/post';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    postsApi.getBySlug(slug)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-spinner" style={{ height: '60vh' }}><div className="spinner" /></div>;
  if (notFound || !post) return (
    <div className="empty-state" style={{ paddingTop: '8rem' }}>
      <div className="empty-state__icon">🔍</div>
      <h2>Post not found</h2>
      <Link to="/blog" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>← Back to Blog</Link>
    </div>
  );

  const publishDate = post.published_at
    ? format(new Date(post.published_at), 'MMMM d, yyyy')
    : null;

  const canonicalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/blog/${post.slug}`
    : undefined;

  return (
    <>
      <SEOHead
        title={post.meta_title ?? post.title}
        description={post.meta_description ?? undefined}
        keywords={post.keywords ?? undefined}
        image={post.thumbnail ?? undefined}
        url={canonicalUrl}
        type="article"
        publishedTime={post.published_at ?? undefined}
        author={post.author?.full_name}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.meta_description,
          image: post.thumbnail,
          url: canonicalUrl,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: { '@type': 'Person', name: post.author?.full_name },
        }}
      />

      <article>
        <div className="post-hero">
          <div className="container">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', color: 'var(--color-text-dim)', fontSize: '0.875rem' }}>
              <Link to="/">Home</Link>
              {' / '}
              <Link to="/blog">Blog</Link>
              {' / '}
              <span>{post.title}</span>
            </nav>

            {/* Categories & date */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {post.categories.map((c) => (
                <Link key={c.id} to={`/category/${c.slug}`} className="badge badge-primary">{c.name}</Link>
              ))}
              {publishDate && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>📅 {publishDate}</span>}
              {post.author && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                  ✍️ {post.author.full_name}
                </span>
              )}
            </div>

            <h1 style={{ marginBottom: '1.5rem' }}>{post.title}</h1>

            {/* Thumbnail */}
            {post.thumbnail && (
              <div className="post-hero__thumbnail">
                <img src={post.thumbnail} alt={post.title} />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="container">
          <div className="post-content">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {post.content}
            </ReactMarkdown>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Tags</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {post.tags.map((tag) => (
                    <Link key={tag.id} to={`/tag/${tag.slug}`} className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}>
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
              <Link to="/blog" className="btn btn-ghost">← Back to All Articles</Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
