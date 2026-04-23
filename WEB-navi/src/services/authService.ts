import type { AuthUser, LoginRequest, RegisterRequest, TokenResponse } from '../models/auth';
import { authApi } from './apiClient';

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const response = await authApi.post<TokenResponse>('/login', payload);
  return response.data;
}

export async function register(payload: RegisterRequest, token?: string): Promise<AuthUser> {
  const response = await authApi.post<AuthUser>('/register', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await authApi.get<AuthUser>('/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function logout(token: string): Promise<void> {
  await authApi.post('/logout', undefined, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
