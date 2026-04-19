import apiClient from './client';
import type { Category, Tag } from '../types/post';
import type { User } from '../types/user';
import type { Tenant } from '../types/tenant';

export const adminApi = {
  // Categories
  listCategories: (): Promise<Category[]> =>
    apiClient.get('/categories').then((r) => r.data),
  createCategory: (data: { name: string; description?: string }): Promise<Category> =>
    apiClient.post('/categories', data).then((r) => r.data),
  deleteCategory: (id: string): Promise<void> =>
    apiClient.delete(`/categories/${id}`).then(() => undefined),

  // Tags
  listTags: (): Promise<Tag[]> =>
    apiClient.get('/tags').then((r) => r.data),
  createTag: (data: { name: string }): Promise<Tag> =>
    apiClient.post('/tags', data).then((r) => r.data),
  deleteTag: (id: string): Promise<void> =>
    apiClient.delete(`/tags/${id}`).then(() => undefined),

  // Users
  listUsers: (): Promise<User[]> =>
    apiClient.get('/users').then((r) => r.data),
  createUser: (data: Partial<User> & { password: string }): Promise<User> =>
    apiClient.post('/users', data).then((r) => r.data),
  deleteUser: (id: string): Promise<void> =>
    apiClient.delete(`/users/${id}`).then(() => undefined),

  // Tenants (super admin)
  listTenants: (): Promise<Tenant[]> =>
    apiClient.get('/tenants').then((r) => r.data),
  createTenant: (data: Partial<Tenant>): Promise<Tenant> =>
    apiClient.post('/tenants', data).then((r) => r.data),
  updateTenant: (id: string, data: Partial<Tenant>): Promise<Tenant> =>
    apiClient.patch(`/tenants/${id}`, data).then((r) => r.data),
};
