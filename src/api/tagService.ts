import type { TagListResponse, TagResponse } from '../types/api';
import { api } from './baseClient';
import { unwrapApiResponse } from './helpers';

export async function getTags() {
  const response = await api.get<TagListResponse>('/tags');
  return unwrapApiResponse(response);
}

export async function createTag(payload: { name: string }) {
  const response = await api.post<TagResponse>('/tags', payload);
  return unwrapApiResponse(response);
}

export async function updateTag(tagId: string, payload: { name: string }) {
  const response = await api.patch<TagResponse>(`/tags/${tagId}`, payload);
  return unwrapApiResponse(response);
}

export async function deleteTag(tagId: string) {
  await api.delete(`/tags/${tagId}`);
}
