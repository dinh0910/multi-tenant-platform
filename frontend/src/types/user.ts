export type UserRole = 'super_admin' | 'tenant_admin' | 'author';

export interface User {
  id: string;
  tenant_id?: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
