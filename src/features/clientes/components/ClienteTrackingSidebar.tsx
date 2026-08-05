import { Link } from 'react-router-dom';
import { Package, MapPin, Bike, Clock, CheckCircle2 } from 'lucide-react';
import type { DeliveryOrder } from '../../../types/order';
import { formatDurationMinutes } from '../../../utils/formatDuration';
import { formatCurrency } from '../../../services/pricingService';

const STATUS_LABELS: Record<DeliveryOrder['status'], string> = {
  PENDING: 'Aguardando motoboy',
  ACCEPTED: 'Motoboy a caminho da origem',
  PICKED_UP: 'Saiu para entrega',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Entregue',
};

interface ClienteTrackingSidebarProps {
  order: DeliveryOrder;
}

export function ClienteTrackingSidebar({ order }: ClienteTrackingSidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-r border-slate-200 bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rastreamento
            </p>
            <h1 className="text-lg font-bold">Pedido {order.trackingCode}</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{STATUS_LABELS[order.status]}</p>
            </div>
            {order.acceptedMotoboyName && order.status !== 'COMPLETED' && (
              <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                <Bike className="h-4 w-4" />
                {order.acceptedMotoboyName}
              </div>
            )}
          </div>

          {order.status === 'PENDING' && (
            <p className="mt-3 text-sm text-slate-600">
              Seu pedido está pronto para entrega e aguardando um motoboy aceitar a corrida.
            </p>
          )}

          {order.status === 'ACCEPTED' && (
            <p className="mt-3 text-sm text-slate-600">
              O motoboy está seguindo a rota até o estabelecimento para retirar o pedido.
            </p>
          )}

          {order.status === 'PICKED_UP' && (
            <p className="mt-3 text-sm text-slate-600">
              Seu pedido saiu para entrega. Acompanhe o motoboy no mapa ao lado.
            </p>
          )}

          {order.status === 'COMPLETED' && (
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Pedido entregue com sucesso!
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-1">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Distância</span>
            </div>
            <p className="mt-2 text-lg font-bold">{order.distanceKm} km</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Tempo est.</span>
            </div>
            <p className="mt-2 text-lg font-bold">~{formatDurationMinutes(order.durationMin)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <span className="text-xs font-semibold uppercase text-slate-500">Valor</span>
            <p className="mt-2 text-lg font-bold">
              {order.price !== null ? formatCurrency(order.price) : '—'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Origem</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{order.origin.address}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Destino</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{order.destination.address}</p>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white p-4 text-center">
        <Link
          to="/clientes"
          className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          Rastrear outro pedido
        </Link>
      </div>
    </aside>
  );
}
