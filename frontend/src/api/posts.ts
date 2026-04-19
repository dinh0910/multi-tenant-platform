import apiClient from './client';
import type { PaginatedPosts, Post, PostCreate, PostUpdate } from '../types/post';

export const postsApi = {
  list: (params: {
    page?: number;
    page_size?: number;
    category_id?: string;
    tag_id?: string;
  } = {}): Promise<PaginatedPosts> =>
    apiClient.get('/posts', { params }).then((r) => r.data),

  getBySlug: (slug: string): Promise<Post> =>
    apiClient.get(`/posts/${slug}`).then((r) => r.data),

  // Admin
  adminList: (params: { page?: number; page_size?: number } = {}): Promise<PaginatedPosts> =>
    apiClient.get('/posts/admin/all', { params }).then((r) => r.data),

  create: (data: PostCreate): Promise<Post> =>
    apiClient.post('/posts', data).then((r) => r.data),

  update: (id: string, data: PostUpdate): Promise<Post> =>
    apiClient.patch(`/posts/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/posts/${id}`).then(() => undefined),
};
