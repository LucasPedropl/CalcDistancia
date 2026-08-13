import { useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMotoboySimulationTicker } from '../../hooks/useMotoboySimulation';
import { useCondominiumProfile, useCondominiumResidents } from '../../hooks/useCondominium';
import { AppViewport } from '../../components/layout/AppViewport';
import { CondominioHeader } from './components/CondominioHeader';
import { CondominioTabBar } from './components/CondominioTabBar';
import { CondominioRegistrationScreen } from './components/CondominioRegistrationScreen';
import { CondominioLocationEditor } from './components/CondominioLocationEditor';
import { CondominioDeliveriesPage } from './pages/CondominioDeliveriesPage';
import { CondominioDocumentsPage } from './pages/CondominioDocumentsPage';
import { CondominioResidentsPage } from './pages/CondominioResidentsPage';
import { CondominioVisitsPage } from './pages/CondominioVisitsPage';
import { CondominioHistoryPage } from './pages/CondominioHistoryPage';
import { CondominioProfilePage } from './pages/CondominioProfilePage';

export function CondominioDashboard() {
  const { user, logout } = useAuth();
  const profile = useCondominiumProfile(user?.id);
  const residents = useCondominiumResidents(user?.id);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  useMotoboySimulationTicker();

  if (!user) return null;

  if (!profile) {
    return (
      <CondominioRegistrationScreen
        userId={user.id}
        userName={user.name}
        onSuccess={() => undefined}
        onLogout={logout}
      />
    );
  }

  const pendingResidentCount = residents.filter((resident) => resident.status === 'PENDING').length;

  return (
    <AppViewport>
      <CondominioHeader
        profile={profile}
        onEditLocation={() => setIsEditingLocation(true)}
        onLogout={logout}
      />

      <CondominioTabBar pendingResidentCount={pendingResidentCount} />

      <Routes>
        <Route index element={<CondominioDeliveriesPage profile={profile} />} />
        <Route path="documentos" element={<CondominioDocumentsPage profile={profile} />} />
        <Route path="moradores" element={<CondominioResidentsPage profile={profile} />} />
        <Route path="auditoria" element={<CondominioVisitsPage profile={profile} />} />
        <Route path="historico" element={<CondominioHistoryPage profile={profile} />} />
        <Route path="perfil" element={<CondominioProfilePage profile={profile} />} />
        <Route path="*" element={<Navigate to="/condominio" replace />} />
      </Routes>

      {isEditingLocation && (
        <CondominioLocationEditor
          profile={profile}
          onSaved={() => setIsEditingLocation(false)}
          onCancel={() => setIsEditingLocation(false)}
        />
      )}

      <p className="shrink-0 border-t border-slate-200 bg-white py-2 text-center text-xs text-slate-400">
        É um estabelecimento?{' '}
        <Link to="/auth/estabelecimento" className="font-semibold text-slate-700 underline">
          Acesse como Estabelecimento
        </Link>
      </p>
    </AppViewport>
  );
}
