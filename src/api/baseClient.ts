import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:7080';

export const publicApi = axios.create({
  baseURL,
  withCredentials: true,
});

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
