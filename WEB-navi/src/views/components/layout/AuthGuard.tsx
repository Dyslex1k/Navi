import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { CircularProgress, Stack } from '@mui/material';
import { useAuthController } from '../../../controllers/auth/useAuthController';

export function AuthGuard({ children }: PropsWithChildren) {
  const { token, loading } = useAuthController();

  if (loading) {
    return (
      <Stack minHeight="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
