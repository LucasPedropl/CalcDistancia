import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LogOut, Route as RouteIcon, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAllCondominiums } from '../../hooks/useCondominium';
import { AppViewport } from '../../components/layout/AppViewport';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminOverviewPage } from './pages/AdminOverviewPage';
import { AdminCondominiumsPage } from './pages/AdminCondominiumsPage';
import { AdminPlansPage } from './pages/AdminPlansPage';
import { AdminPaymentsPage } from './pages/AdminPaymentsPage';
import { AdminContractsPage } from './pages/AdminContractsPage';
import { AdminWhatsappPage } from './pages/AdminWhatsappPage';
import { AdminPickupPage } from './pages/AdminPickupPage';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const condominiums = useAllCondominiums();

  const pendingCondominiumCount = condominiums.filter(
    (condominium) => condominium.partnerStatus === 'PENDING_REVIEW',
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/auth/admin');
  };

  return (
    <AppViewport>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <RouteIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Administração
            </p>
            <h1 className="text-base font-bold">webmottos</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="max-w-[140px] truncate text-xs font-semibold">
              {user?.email ?? 'Administrador'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <AdminSidebar pendingCondominiumCount={pendingCondominiumCount} />

        <Routes>
          <Route index element={<AdminOverviewPage />} />
          <Route path="condominios" element={<AdminCondominiumsPage />} />
          <Route path="planos" element={<AdminPlansPage />} />
          <Route path="pagamentos" element={<AdminPaymentsPage />} />
          <Route path="contratos" element={<AdminContractsPage />} />
          <Route path="whatsapp" element={<AdminWhatsappPage />} />
          <Route path="coleta" element={<AdminPickupPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </AppViewport>
  );
}
