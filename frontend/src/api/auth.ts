import axios from 'axios';
import type { LoginRequest, TokenResponse, User } from '../types/user';

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await axios.post('/api/v1/auth/login', data);
    return res.data;
  },

  me: async (): Promise<User> => {
    const token = localStorage.getItem('access_token');
    const res = await axios.get('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};
