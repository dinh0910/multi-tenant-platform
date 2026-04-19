import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { PostListItem } from '../types/post';

interface PostCardProps {
  post: PostListItem;
}

export default function PostCard({ post }: PostCardProps) {
  const date = post.published_at
    ? format(new Date(post.published_at), 'MMM d, yyyy')
    : format(new Date(post.created_at), 'MMM d, yyyy');

  return (
    <Link to={`/blog/${post.slug}`} className="post-card card">
      <div className="post-card__image">
        {post.thumbnail ? (
          <img src={post.thumbnail} alt={post.title} loading="lazy" />
        ) : (
          <div
            style={{
              height: 200,
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              opacity: 0.4,
            }}
          >
            📝
          </div>
        )}
      </div>
      <div className="post-card__body">
        <div className="post-card__meta">
          {post.categories.slice(0, 2).map((cat) => (
            <span key={cat.id} className="badge badge-primary">
              {cat.name}
            </span>
          ))}
          <span className="post-card__date">{date}</span>
        </div>
        <h3 className="post-card__title">{post.title}</h3>
        {post.meta_description && (
          <p className="post-card__excerpt">{post.meta_description}</p>
        )}
        {post.tags.length > 0 && (
          <div className="post-card__tags">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}>
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
