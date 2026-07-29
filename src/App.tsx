import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './features/auth/components/Login';
import { LandingPage } from './features/auth/components/LandingPage';
import { ClienteDashboard } from './features/cliente/ClienteDashboard';
import { MotoboyDashboard } from './features/motoboys/MotoboyDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminLogin } from './features/admin/components/AdminLogin';

const ProtectedRoute = ({
  children,
  allowedRoles,
  loginPath = '/',
}: {
  children: React.ReactNode;
  allowedRoles: string[];
  loginPath?: string;
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={loginPath} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/admin" element={<AdminLogin />} />
      <Route path="/auth/:type" element={<Login />} />
      <Route path="/login" element={<Navigate to="/" replace />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} loginPath="/auth/admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cliente/*"
        element={
          <ProtectedRoute allowedRoles={['CLIENTE']}>
            <ClienteDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/motoboy/*" 
        element={
          <ProtectedRoute allowedRoles={['MOTOBOY']}>
            <MotoboyDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default App;
