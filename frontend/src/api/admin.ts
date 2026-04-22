import apiClient from './client';
import type { Category, Tag } from '../types/post';
import type { User } from '../types/user';
import type { Tenant } from '../types/tenant';

export const adminApi = {
  // Categories
  listCategories: (): Promise<Category[]> =>
    apiClient.get('/categories'),
  createCategory: (data: { name: string; description?: string }): Promise<Category> =>
    apiClient.post('/categories', data),
  deleteCategory: (id: string): Promise<void> =>
    apiClient.delete(`/categories/${id}`),

  // Tags
  listTags: (): Promise<Tag[]> =>
    apiClient.get('/tags'),
  createTag: (data: { name: string }): Promise<Tag> =>
    apiClient.post('/tags', data),
  deleteTag: (id: string): Promise<void> =>
    apiClient.delete(`/tags/${id}`),

  // Users
  listUsers: (): Promise<User[]> =>
    apiClient.get('/users'),
  createUser: (data: Partial<User> & { password: string }): Promise<User> =>
    apiClient.post('/users', data),
  deleteUser: (id: string): Promise<void> =>
    apiClient.delete(`/users/${id}`),

  // Tenants
  listTenants: (): Promise<Tenant[]> =>
    apiClient.get('/tenants'),
  createTenant: (data: Partial<Tenant>): Promise<Tenant> =>
    apiClient.post('/tenants', data),
  updateTenant: (id: string, data: Partial<Tenant>): Promise<Tenant> =>
    apiClient.patch(`/tenants/${id}`, data),
};
