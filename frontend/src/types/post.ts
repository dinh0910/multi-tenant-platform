export type PostStatus = 'draft' | 'published';

export interface Author {
  id: string;
  full_name: string;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tenant_id: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  tenant_id: string;
  created_at: string;
}

export interface Post {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  status: PostStatus;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: Author;
  categories: Category[];
  tags: Tag[];
}

export interface PostListItem
  extends Omit<Post, 'content'> {}

export interface PaginatedPosts {
  items: PostListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface PostCreate {
  title: string;
  slug?: string;
  content?: string;
  thumbnail?: string;
  status?: PostStatus;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  category_ids?: string[];
  tag_ids?: string[];
}

export interface PostUpdate extends Partial<PostCreate> {}
