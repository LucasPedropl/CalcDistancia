import {
  Package,
  MapPin,
  XCircle,
  Loader2,
  CheckCircle,
  Bike,
  Phone,
} from 'lucide-react';
import type { ClientProfile } from '../../../services/clientProfileService';
import type { DeliveryOrder } from '../../../types/order';
import {
  AddressRegistrationForm,
  type AddressRegistrationFormHandle,
} from '../../../components/AddressRegistrationForm';
import { formatPhoneMask } from '../../../utils/phoneValidation';

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Aguardando motoboy',
  ACCEPTED: 'Motoboy a caminho',
  PICKED_UP: 'Saiu para entrega',
};

interface ClientePortalSidebarProps {
  profile: ClientProfile;
  needsAddress: boolean;
  needsPhone: boolean;
  activeOrder: DeliveryOrder | null;
  formRef: React.RefObject<AddressRegistrationFormHandle | null>;
  onSaveAddress: () => void;
  onSavePhone: () => void;
  onPhoneChange: (phone: string) => void;
  onCancelOrder: () => void;
}

export function ClientePortalSidebar({
  profile,
  needsAddress,
  needsPhone,
  activeOrder,
  formRef,
  onSaveAddress,
  onSavePhone,
  onPhoneChange,
  onCancelOrder,
}: ClientePortalSidebarProps) {

  if (needsAddress || needsPhone) {
    return (
      <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-200 bg-slate-50 text-slate-900">
        <div className="border-b border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold">Cadastre seu endereço</h2>
              <p className="text-sm text-slate-500">
                O estabelecimento envia a encomenda até você — aqui você acompanha.
              </p>
            </div>
          </div>

          {needsAddress ? (
            <>
              <AddressRegistrationForm ref={formRef} enableStreetSearch />
              <button
                type="button"
                onClick={() => void onSaveAddress()}
                className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                Salvar endereço
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Telefone para vincular pedidos
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => onPhoneChange(formatPhoneMask(e.target.value))}
                  placeholder="(27) 99999-0001"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm"
                />
              </div>
              <p className="text-xs text-slate-500">
                Use este número no pedido do estabelecimento para vincular automaticamente.
              </p>
              <button
                type="button"
                onClick={onSavePhone}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                Confirmar telefone
              </button>
            </div>
          )}
        </div>
      </aside>
    );
  }

  if (!activeOrder) {
    return (
      <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-200 bg-slate-50 text-slate-900">
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
            <Package className="h-7 w-7 text-slate-500" />
          </div>
          <h2 className="text-xl font-bold">Nenhuma entrega ativa</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            Quando um estabelecimento enviar uma encomenda para{' '}
            <strong>{profile.homeAddress?.address}</strong>, ela aparecerá aqui com rastreamento
            em tempo real.
          </p>
          <p className="mt-3 text-xs text-slate-400">Telefone: {profile.phone}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-200 bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {ORDER_STATUS_LABELS[activeOrder.status] ?? activeOrder.status}
            </p>
            <h2 className="text-lg font-bold">{activeOrder.clientName}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pedido <span className="font-mono text-xs">{activeOrder.id}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelOrder}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4" />
            Cancelar
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Origem</span>
          <p className="mt-1 text-sm font-medium">{activeOrder.origin.address}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Destino</span>
          <p className="mt-1 text-sm font-medium">{activeOrder.destination.address}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Motoboy</span>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
            {activeOrder.acceptedMotoboyName ? (
              <>
                <Bike className="h-4 w-4 text-emerald-600" />
                {activeOrder.acceptedMotoboyName}
              </>
            ) : (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                Aguardando aceite
              </>
            )}
          </p>
        </div>

        {activeOrder.status !== 'PENDING' && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Motoboy em movimento no mapa — posição atualizada em tempo real.
          </div>
        )}
      </div>
    </aside>
  );
}
