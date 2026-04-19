import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { postsApi } from '../../api/posts';
import type { PostListItem } from '../../types/post';
import Pagination from '../../components/Pagination';

export default function PostsPage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = (p = 1) => {
    setLoading(true);
    postsApi.adminList({ page: p, page_size: 15 })
      .then((d) => {
        setPosts(d.items);
        setTotal(d.total);
        setPages(d.pages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    await postsApi.delete(id);
    load(page);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Posts</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{total} total post{total !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin/posts/new" className="btn btn-primary" id="new-post-btn">+ New Post</Link>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Categories</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>No posts yet.</td></tr>
                ) : posts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: 2 }}>{p.slug}</div>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.categories.map((c) => (
                        <span key={c.id} className="badge badge-primary" style={{ marginRight: 4 }}>{c.name}</span>
                      ))}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      {p.published_at ? format(new Date(p.published_at), 'MMM d, yyyy') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/admin/posts/${p.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
