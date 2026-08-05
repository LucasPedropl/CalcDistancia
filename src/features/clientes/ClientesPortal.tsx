import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  loadClientProfile,
  updateClientHomeAddress,
  updateClientPhone,
} from '../../services/clientProfileService';
import { registerClientAccount } from '../../services/registeredClientService';
import { cancelOrder } from '../../services/orderService';
import { useActiveOrderForRecipient } from '../../hooks/useOrders';
import { useMotoboySimulationTicker } from '../../hooks/useMotoboySimulation';
import { AppViewport } from '../../components/layout/AppViewport';
import { ResponsiveMapShell } from '../../components/layout/ResponsiveMapShell';
import { type AddressRegistrationFormHandle } from '../../components/AddressRegistrationForm';
import { ClienteTrackingMap } from './components/ClienteTrackingMap';
import { ClienteOrderChatWidget } from './components/ClienteOrderChatWidget';
import { ClientePortalSidebar } from './components/ClientePortalSidebar';

export function ClientesPortal() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(() =>
    user ? loadClientProfile(user.id) : loadClientProfile(''),
  );
  const formRef = useRef<AddressRegistrationFormHandle>(null);

  useMotoboySimulationTicker();

  const activeOrder = useActiveOrderForRecipient(
    user?.id,
    profile.phone,
    profile.homeAddress,
  );

  if (!user) return null;

  const handleSaveAddress = async () => {
    const location = await formRef.current?.resolveLocation();
    if (!location) return;

    const updated = updateClientHomeAddress(user.id, location);
    setProfile(updated);
  };

  const handleSavePhone = () => {
    const updated = updateClientPhone(user.id, profile.phone);
    setProfile(updated);
    registerClientAccount({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: updated.phone,
    });
  };

  const handleCancelOrder = () => {
    if (!activeOrder) return;
    const confirmed = window.confirm('Deseja cancelar esta entrega?');
    if (!confirmed) return;
    cancelOrder(activeOrder.id, 'CLIENT');
  };

  const needsAddress = !profile.homeAddress;
  const needsPhone = !profile.phone;

  return (
    <AppViewport>
      <header className="relative z-40 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Área do Cliente
            </p>
            <h1 className="truncate text-sm font-bold sm:text-lg">Olá, {user.name}</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </header>

      <ResponsiveMapShell
        mapLabel="Mapa"
        panelLabel="Entrega"
        defaultMobileView={activeOrder ? 'map' : 'panel'}
        panel={
          <ClientePortalSidebar
            profile={profile}
            needsAddress={needsAddress}
            needsPhone={needsPhone}
            activeOrder={activeOrder}
            formRef={formRef}
            onSaveAddress={() => void handleSaveAddress()}
            onSavePhone={handleSavePhone}
            onPhoneChange={(phone) => setProfile((prev) => ({ ...prev, phone }))}
            onCancelOrder={handleCancelOrder}
          />
        }
        map={
          activeOrder ? (
            <ClienteTrackingMap order={activeOrder} />
          ) : (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center bg-slate-100 p-6 text-center text-slate-500">
              {profile.homeAddress ? (
                <>
                  <p className="text-sm font-medium text-slate-700">Seu endereço cadastrado</p>
                  <p className="mt-2 max-w-md text-sm">{profile.homeAddress.address}</p>
                  <p className="mt-3 text-xs">O mapa de rastreamento aparece quando houver entrega ativa.</p>
                </>
              ) : (
                <p className="text-sm">Cadastre seu endereço para começar</p>
              )}
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

      {activeOrder && (
        <ClienteOrderChatWidget
          orderId={activeOrder.id}
          currentUserId={user.id}
          currentUserName={user.name}
          motoboyName={activeOrder.acceptedMotoboyName}
          establishmentName={activeOrder.clientName}
        />
      )}
    </AppViewport>
  );
}
