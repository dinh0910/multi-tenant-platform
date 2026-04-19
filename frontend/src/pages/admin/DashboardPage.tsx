import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import { adminApi } from '../../api/admin';

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalTags: number;
  totalUsers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0, publishedPosts: 0, draftPosts: 0,
    totalCategories: 0, totalTags: 0, totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      postsApi.adminList({ page: 1, page_size: 1 }),
      adminApi.listCategories(),
      adminApi.listTags(),
      adminApi.listUsers(),
    ]).then(([posts, cats, tags, users]) => {
      setStats({
        totalPosts: posts.total,
        publishedPosts: 0, // summary only
        draftPosts: 0,
        totalCategories: cats.length,
        totalTags: tags.length,
        totalUsers: users.length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const statItems = [
    { icon: '📝', value: stats.totalPosts, label: 'Total Posts', link: '/admin/posts' },
    { icon: '📁', value: stats.totalCategories, label: 'Categories', link: '/admin/categories' },
    { icon: '🏷️', value: stats.totalTags, label: 'Tags', link: '/admin/tags' },
    { icon: '👥', value: stats.totalUsers, label: 'Users', link: '/admin/users' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Welcome back! Here's an overview.</p>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="stats-grid">
          {statItems.map((s) => (
            <Link key={s.label} to={s.link} className="stat-card" style={{ textDecoration: 'none' }}>
              <div className="stat-card__icon">{s.icon}</div>
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <Link to="/admin/posts/new" className="btn btn-primary" id="dashboard-new-post-btn">
          + New Post
        </Link>
      </div>
    </div>
  );
}
