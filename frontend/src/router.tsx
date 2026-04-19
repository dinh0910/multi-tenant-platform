import { createBrowserRouter, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import CategoryPage from './pages/CategoryPage';
import TagPage from './pages/TagPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import PostsPage from './pages/admin/PostsPage';
import PostEditorPage from './pages/admin/PostEditorPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import TagsPage from './pages/admin/TagsPage';
import UsersPage from './pages/admin/UsersPage';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  // ── Public blog routes
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/:slug', element: <BlogDetailPage /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'tag/:slug', element: <TagPage /> },
    ],
  },

  // ── Admin routes
  { path: '/admin/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/posts" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'posts', element: <PostsPage /> },
      { path: 'posts/new', element: <PostEditorPage /> },
      { path: 'posts/:id/edit', element: <PostEditorPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'tags', element: <TagsPage /> },
      { path: 'users', element: <UsersPage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
