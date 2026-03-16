import type { AxiosResponse } from 'axios';
import type { ApiEnvelope } from '../types/api';

export function unwrapApiResponse<T>(response: AxiosResponse<T | ApiEnvelope<T>>) {
  const payload = response.data as T | ApiEnvelope<T>;
  if (payload && typeof payload === 'object' && 'data' in payload && 'status' in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

export function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message;
  }

  return undefined;
}
