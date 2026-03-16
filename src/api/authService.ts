import { encryptLoginPayload } from '../auth/encryption';
import type { LoginResponse, UserMe } from '../types/api';
import { publicApi, api } from './baseClient';
import { unwrapApiResponse } from './helpers';

function getPublicKey() {
  const value = import.meta.env.VITE_RSA_PUBLIC_KEY;
  if (!value) {
    throw new Error('VITE_RSA_PUBLIC_KEY is missing. Add it to your environment before logging in.');
  }

  return value;
}

export async function loginRequest(email: string, password: string) {
  const payload = encryptLoginPayload(email, password, getPublicKey());
  const response = await publicApi.post<LoginResponse>('/auth/login', payload);
  return unwrapApiResponse(response);
}

export async function refreshTokenRequest() {
  const response = await publicApi.post<LoginResponse>('/auth/refresh-token');
  return unwrapApiResponse(response);
}

export async function getMeRequest() {
  const response = await api.get<UserMe>('/auth/me');
  return unwrapApiResponse(response);
}

export async function logoutRequest() {
  await api.post('/auth/logout');
}
