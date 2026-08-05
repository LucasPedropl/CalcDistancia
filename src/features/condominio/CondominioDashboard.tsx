import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  loadCondominiumProfile,
  registerCondominium,
  type CondominiumProfile,
} from '../../services/condominiumService';
import { useOrdersForCondominium } from '../../hooks/useOrders';
import { useMotoboySimulationTicker } from '../../hooks/useMotoboySimulation';
import { AppViewport } from '../../components/layout/AppViewport';
import { ResponsiveMapShell } from '../../components/layout/ResponsiveMapShell';
import { CondominioMap } from './components/CondominioMap';
import { CondominioDeliveriesSidebar } from './components/CondominioDeliveriesSidebar';
import {
  type AddressRegistrationFormHandle,
} from '../../components/AddressRegistrationForm';

export function CondominioDashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<CondominiumProfile | null>(() =>
    user ? loadCondominiumProfile(user.id) : null,
  );
  const [condoName, setCondoName] = useState(profile?.name ?? '');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const formRef = useRef<AddressRegistrationFormHandle>(null);

  useMotoboySimulationTicker();

  const activeDeliveries = useOrdersForCondominium(user?.id, profile?.address ?? null);

  if (!user) return null;

  const handleRegister = async () => {
    setRegisterError(null);
    const location = await formRef.current?.resolveLocation();
    if (!location) {
      setRegisterError('Preencha o endereço completo do condomínio.');
      return;
    }

    try {
      const registered = registerCondominium(user.id, condoName, location);
      setProfile(registered);
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Erro ao cadastrar condomínio.');
    }
  };

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
            <h1 className="truncate text-sm font-bold sm:text-lg">
              {profile?.name ?? user.name}
            </h1>
          </div>
        </div>
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
        defaultMobileView={profile ? 'panel' : 'map'}
        panel={
          <CondominioDeliveriesSidebar
            profile={profile}
            condoName={condoName}
            onCondoNameChange={setCondoName}
            activeDeliveries={activeDeliveries}
            registerError={registerError}
            onRegister={handleRegister}
            formRef={formRef}
          />
        }
        map={
          profile ? (
            <CondominioMap profile={profile} activeDeliveries={activeDeliveries} />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center bg-slate-100 text-slate-500">
              <p className="text-sm">Cadastre o condomínio para ver o mapa</p>
            </div>
          )
        }
      />

      <p className="shrink-0 border-t border-slate-200 bg-white py-2 text-center text-xs text-slate-400">
        É um estabelecimento?{' '}
        <Link to="/auth/estabelecimento" className="font-semibold text-slate-700 underline">
          Acesse como Estabelecimento
        </Link>
      </p>
    </AppViewport>
  );
}
