import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthController } from '../controllers/auth/useAuthController';
import { AuthGuard } from '../views/components/layout/AuthGuard';
import { DashboardPage } from '../views/pages/DashboardPage';
import { LoginPage } from '../views/pages/LoginPage';
import { RegisterPage } from '../views/pages/RegisterPage';

export function AppRouter() {
  const { token } = useAuthController();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/maps" replace /> : <LoginPage />} />
      <Route path="/register" element={token ? <Navigate to="/maps" replace /> : <RegisterPage />} />
      <Route
        path="/maps"
        element={
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to={token ? '/maps' : '/login'} replace />} />
    </Routes>
  );
}
