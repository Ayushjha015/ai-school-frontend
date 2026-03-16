import { create } from 'zustand';
import { queryClient } from '../utils/queryClient';
import { getMeRequest, loginRequest, logoutRequest, refreshTokenRequest } from '../api/authService';
import type { AuthStatus, UserMe } from '../types/api';

interface AuthStoreState {
  accessToken: string | null;
  user: UserMe | null;
  status: AuthStatus;
  isBootstrapping: boolean;
  setAccessToken: (token: string | null) => void;
  clearSession: () => void;
  bootstrapSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<UserMe>;
  logout: () => Promise<void>;
}

let bootstrapPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  accessToken: null,
  user: null,
  status: 'idle',
  isBootstrapping: true,
  setAccessToken: (token) => set({ accessToken: token }),
  clearSession: () => {
    set({ accessToken: null, user: null, status: 'unauthenticated', isBootstrapping: false });
  },
  bootstrapSession: async () => {
    if (get().status === 'authenticated' || bootstrapPromise) {
      return bootstrapPromise ?? Promise.resolve();
    }

    bootstrapPromise = (async () => {
      set({ isBootstrapping: true });
      try {
        const refresh = await refreshTokenRequest();
        set({ accessToken: refresh.accessToken });
        const user = await getMeRequest();
        set({ user, status: 'authenticated', isBootstrapping: false });
      } catch {
        set({ accessToken: null, user: null, status: 'unauthenticated', isBootstrapping: false });
      } finally {
        bootstrapPromise = null;
      }
    })();

    return bootstrapPromise;
  },
  login: async (email, password) => {
    set({ status: 'loading' });
    try {
      const loginResponse = await loginRequest(email, password);
      set({ accessToken: loginResponse.accessToken });
      const user = await getMeRequest();
      set({ user, status: 'authenticated', isBootstrapping: false });
      return user;
    } catch (error) {
      set({ accessToken: null, user: null, status: 'unauthenticated', isBootstrapping: false });
      throw error;
    }
  },
  logout: async () => {
    try {
      await logoutRequest();
    } finally {
      get().clearSession();
      queryClient.clear();
    }
  },
}));
