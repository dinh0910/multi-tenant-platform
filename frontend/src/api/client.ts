import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ── Token storage ─────────────────────────────────────────────────────────────
export const tokenStorage = {
  getAccess: () => localStorage.getItem('access_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  set: (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptors ──────────────────────────────────────────────────────────────

// Request: Attach token
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: Bóc tách data + Xử lý lỗi tập trung
apiClient.interceptors.response.use(
  (response) => {
    // Tự động trả về data, bạn không cần gọi .data ở ngoài nữa
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 1. Xử lý lỗi 422 (Validation Error) để debug dễ hơn
    if (error.response?.status === 422) {
      console.error('❌ Validation Error (422):', error.response.data);
      // Bạn có thể thông báo cho người dùng tại đây hoặc để component xử lý
    }

    // 2. Xử lý Auto Refresh Token cho lỗi 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenStorage.getRefresh();

      if (refreshToken) {
        try {
          const res = await refreshClient.post('/auth/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token } = res.data;
          
          tokenStorage.set(access_token, refresh_token);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return apiClient(originalRequest);
        } catch (refreshErr) {
          tokenStorage.clear();
          window.location.href = '/admin/login';
        }
      } else {
        tokenStorage.clear();
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
