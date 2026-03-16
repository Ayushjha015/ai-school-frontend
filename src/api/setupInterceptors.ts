import type { QueryClient } from '@tanstack/react-query';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { api, publicApi } from './baseClient';
import { unwrapApiResponse } from './helpers';
import { useAuthStore } from '../store/authStore';
import type { LoginResponse } from '../types/api';

let initialized = false;

function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

export function setupApiInterceptors(queryClient: QueryClient) {
  if (initialized) {
    return;
  }

  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;
      const pathname = originalRequest?.url ?? '';

      if (
        status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !pathname.includes('/auth/login') &&
        !pathname.includes('/auth/refresh-token')
      ) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await publicApi.post<LoginResponse>('/auth/refresh-token');
          const refreshed = unwrapApiResponse(refreshResponse);
          useAuthStore.getState().setAccessToken(refreshed.accessToken);
          originalRequest.headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
          return api(originalRequest);
        } catch {
          useAuthStore.getState().clearSession();
          queryClient.clear();
          toast.error('Session expired. Please log in again.');
          redirectToLogin();
          return Promise.reject(error);
        }
      }

      if (!error.response) {
        toast.error('Cannot connect to the server. Check your connection.');
        return Promise.reject(error);
      }

      if (status === 403) {
        toast.error("You don't have permission to access this resource.");
      } else if (status === 404) {
        toast.error('Resource not found.');
      } else if (status === 409) {
        toast.error('This action conflicts with existing data.');
      } else if (status === 500) {
        toast.error('Server error. Please try again later.');
      }

      return Promise.reject(error);
    },
  );

  initialized = true;
}
