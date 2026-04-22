import apiClient from './client';
import type { LoginRequest, TokenResponse, User } from '../types/user';

export const authApi = {
  login: (data: LoginRequest): Promise<TokenResponse> => 
    apiClient.post('/auth/login', data),

  me: (): Promise<User> => 
    apiClient.get('/users/me'),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
