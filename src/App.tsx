import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './features/auth/components/Login';
import { LandingPage } from './features/auth/components/LandingPage';
import { ClienteDashboard } from './features/cliente/ClienteDashboard';
import { MotoboyDashboard } from './features/motoboys/MotoboyDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminLogin } from './features/admin/components/AdminLogin';
import { ClientesPortal } from './features/clientes/ClientesPortal';
import { CondominioDashboard } from './features/condominio/CondominioDashboard';

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
    if (user.role === 'ESTABELECIMENTO') {
      return <Navigate to="/estabelecimento" replace />;
    }
    if (user.role === 'MOTOBOY') {
      return <Navigate to="/motoboy" replace />;
    }
    if (user.role === 'CLIENTE') {
      return <Navigate to="/clientes" replace />;
    }
    if (user.role === 'CONDOMINIO') {
      return <Navigate to="/condominio" replace />;
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

      <Route path="/cliente/*" element={<Navigate to="/estabelecimento" replace />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} loginPath="/auth/admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/estabelecimento/*"
        element={
          <ProtectedRoute allowedRoles={['ESTABELECIMENTO']}>
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

      <Route
        path="/clientes/*"
        element={
          <ProtectedRoute allowedRoles={['CLIENTE']} loginPath="/auth/clientes">
            <ClientesPortal />
          </ProtectedRoute>
        }
      />

      <Route
        path="/condominio/*"
        element={
          <ProtectedRoute allowedRoles={['CONDOMINIO']} loginPath="/auth/condominio">
            <CondominioDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
