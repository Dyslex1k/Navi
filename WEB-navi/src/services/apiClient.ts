import axios from 'axios';

function normalizeBaseUrl(rawValue: string | undefined, fallback: string): string {
  if (!rawValue) {
    return fallback;
  }

  if (rawValue.startsWith('/')) {
    return rawValue;
  }

  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
    return rawValue;
  }

  return `http://${rawValue}`;
}

const AUTH_API_URL = normalizeBaseUrl(import.meta.env.VITE_AUTH_API_URL, '/auth');
const MAP_API_URL = normalizeBaseUrl(import.meta.env.VITE_MAP_API_URL, '/map');

export const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mapApi = axios.create({
  baseURL: MAP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
