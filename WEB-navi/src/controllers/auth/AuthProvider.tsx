import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { AuthUser, LoginRequest, RegisterRequest } from '../../models/auth';
import { getCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../../services/authService';
import { AuthContext } from './AuthContext';

const TOKEN_STORAGE_KEY = 'auth-token';

export function AuthProvider({ children }: PropsWithChildren) {
  // 1. Initialize state using a lazy initializer function.
  // This reads from localStorage only on the very first render.
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  
  // 2. Derive initial loading state. 
  // If there is no token, we aren't loading anything, so it's false.
  // If there is a token, we are waiting for hydrateUser, so it's true.
  const [loading, setLoading] = useState<boolean>(Boolean(token));

  const hydrateUser = useCallback(async (nextToken: string) => {
    try {
      const me = await getCurrentUser(nextToken);
      setUser(me);
    } catch (error) {
      console.log(error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If there's no token, we ensure loading is false. 
    // Because we initialized 'loading' based on 'token' above, 
    // we no longer need to call setState synchronously here.
    if (!token) {
      return;
    }

    // If we have a token, trigger the async hydration.
    hydrateUser(token);
  }, [token, hydrateUser]);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await loginRequest(payload);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
    setToken(response.access_token);
    const me = await getCurrentUser(response.access_token);
    setUser(me);
  }, []);

  const register = useCallback(
    async (payload: RegisterRequest) => {
      await registerRequest(payload, token ?? undefined);
    },
    [token],
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutRequest(token);
      } catch {
        // Ignore logout failure and clear client session.
      }
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}