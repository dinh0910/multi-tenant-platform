import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { postsApi } from '../../api/posts';
import { adminApi } from '../../api/admin';
import type { Post, PostCreate, PostUpdate, Category, Tag } from '../../types/post';

export default function PostEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminApi.listCategories(), adminApi.listTags()]).then(([cats, tags]) => {
      setAllCategories(cats);
      setAllTags(tags);
    });

    if (id) {
      // Load existing post by fetching admin list and finding by id
      postsApi.adminList({ page: 1, page_size: 200 }).then((d) => {
        const post = d.items.find((p) => p.id === id);
        if (post) {
          setTitle(post.title);
          setSlug(post.slug);
          setThumbnail(post.thumbnail ?? '');
          setStatus(post.status);
          setMetaTitle(post.meta_title ?? '');
          setMetaDesc(post.meta_description ?? '');
          setKeywords(post.keywords ?? '');
          setSelectedCategories(post.categories.map((c) => c.id));
          setSelectedTags(post.tags.map((t) => t.id));
        }
      });
      // Also load full content
      // Note: for full content we'd need a getById endpoint; using slug approach if available
    }
  }, [id]);

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const payload: PostCreate | PostUpdate = {
        title,
        slug: slug || undefined,
        content,
        thumbnail: thumbnail || undefined,
        status,
        meta_title: metaTitle || undefined,
        meta_description: metaDesc || undefined,
        keywords: keywords || undefined,
        category_ids: selectedCategories,
        tag_ids: selectedTags,
      };

      if (isEdit && id) {
        await postsApi.update(id, payload as PostUpdate);
      } else {
        await postsApi.create(payload as PostCreate);
      }
      navigate('/admin/posts');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save post. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = (id: string, selected: string[], setSelected: (v: string[]) => void) => {
    setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem' }}>{isEdit ? 'Edit Post' : 'New Post'}</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/posts')}>Cancel</button>
          <button
            className="btn btn-primary"
            id="save-post-btn"
            onClick={handleSave}
            disabled={saving || !title}
          >
            {saving ? 'Saving…' : isEdit ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
          color: 'var(--color-danger)', marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      <div className="editor-layout">
        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="editor-panel">
            <div className="editor-panel__title">Content</div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="post-title">Title *</label>
              <input
                id="post-title"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title..."
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="post-slug">Slug</label>
              <input
                id="post-slug"
                className="form-control"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-if-empty"
              />
            </div>
            <div data-color-mode="dark">
              <MDEditor
                value={content}
                onChange={(v) => setContent(v ?? '')}
                height={500}
                id="post-content-editor"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status */}
          <div className="editor-panel">
            <div className="editor-panel__title">Publish</div>
            <div className="form-group">
              <label className="form-label" htmlFor="post-status">Status</label>
              <select
                id="post-status"
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label" htmlFor="post-thumbnail">Thumbnail URL</label>
              <input
                id="post-thumbnail"
                className="form-control"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://..."
              />
              {thumbnail && <img src={thumbnail} alt="preview" style={{ marginTop: 8, borderRadius: 'var(--radius-sm)', maxHeight: 120, objectFit: 'cover' }} />}
            </div>
          </div>

          {/* SEO */}
          <div className="editor-panel">
            <div className="editor-panel__title">SEO</div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" htmlFor="meta-title">Meta Title</label>
              <input id="meta-title" className="form-control" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={title} />
            </div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" htmlFor="meta-description">Meta Description</label>
              <textarea id="meta-description" className="form-control" value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3} placeholder="Short description for search engines..." />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="meta-keywords">Keywords</label>
              <input id="meta-keywords" className="form-control" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="keyword1, keyword2..." />
            </div>
          </div>

          {/* Categories */}
          <div className="editor-panel">
            <div className="editor-panel__title">Categories</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {allCategories.map((c) => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c.id)}
                    onChange={() => toggleItem(c.id, selectedCategories, setSelectedCategories)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  {c.name}
                </label>
              ))}
              {allCategories.length === 0 && <p style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>No categories yet.</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="editor-panel">
            <div className="editor-panel__title">Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allTags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleItem(t.id, selectedTags, setSelectedTags)}
                  className="badge"
                  style={{
                    cursor: 'pointer',
                    background: selectedTags.includes(t.id) ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                    color: selectedTags.includes(t.id) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    border: selectedTags.includes(t.id) ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                  }}
                >
                  #{t.name}
                </button>
              ))}
              {allTags.length === 0 && <p style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>No tags yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
