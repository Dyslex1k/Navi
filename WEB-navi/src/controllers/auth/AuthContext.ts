import { createContext } from 'react';
import type { AuthUser, LoginRequest, RegisterRequest } from '../../models/auth';

export type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
