import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  loadCondominiumProfile,
  type CondominiumProfile,
} from '../../services/condominiumService';
import { useOrdersForCondominium } from '../../hooks/useOrders';
import { useMotoboySimulationTicker } from '../../hooks/useMotoboySimulation';
import { AppViewport } from '../../components/layout/AppViewport';
import { ResponsiveMapShell } from '../../components/layout/ResponsiveMapShell';
import { CondominioMap } from './components/CondominioMap';
import { CondominioDeliveriesSidebar } from './components/CondominioDeliveriesSidebar';
import { CondominioRegistrationScreen } from './components/CondominioRegistrationScreen';
import { CondominioLocationEditor } from './components/CondominioLocationEditor';

export function CondominioDashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<CondominiumProfile | null>(() =>
    user ? loadCondominiumProfile(user.id) : null,
  );

  useMotoboySimulationTicker();

  const activeDeliveries = useOrdersForCondominium(user?.id, profile?.address ?? null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const selectedOrder = useMemo(() => {
    if (activeDeliveries.length === 0) return null;
    if (selectedOrderId) {
      return activeDeliveries.find((order) => order.id === selectedOrderId) ?? activeDeliveries[0];
    }
    return activeDeliveries[0];
  }, [activeDeliveries, selectedOrderId]);

  useEffect(() => {
    if (activeDeliveries.length === 0) {
      setSelectedOrderId(null);
      return;
    }
    if (!selectedOrderId || !activeDeliveries.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(activeDeliveries[0].id);
    }
  }, [activeDeliveries, selectedOrderId]);

  if (!user) return null;

  if (!profile) {
    return (
      <CondominioRegistrationScreen
        userId={user.id}
        userName={user.name}
        onSuccess={setProfile}
        onLogout={logout}
      />
    );
  }

  return (
    <AppViewport>
      <header className="relative z-40 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 font-black text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Painel do Condomínio
            </p>
            <h1 className="truncate text-sm font-bold sm:text-lg">{profile.name}</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditingLocation(true)}
          className="mr-2 inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          <MapPin className="h-4 w-4" />
          Localização
        </button>
        <button
          type="button"
          onClick={logout}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </header>

      <ResponsiveMapShell
        mapLabel="Mapa"
        panelLabel="Entregas"
        defaultMobileView="panel"
        panel={
          <CondominioDeliveriesSidebar
            profile={profile}
            activeDeliveries={activeDeliveries}
            selectedOrderId={selectedOrder?.id ?? null}
            onSelectOrder={setSelectedOrderId}
          />
        }
        map={
          <CondominioMap
            profile={profile}
            activeDeliveries={activeDeliveries}
            selectedOrder={selectedOrder}
          />
        }
      />

      {isEditingLocation && (
        <CondominioLocationEditor
          profile={profile}
          onSaved={(updated) => {
            setProfile(updated);
            setIsEditingLocation(false);
          }}
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
