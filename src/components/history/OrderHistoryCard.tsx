import { Bike, Building2, MapPin, Store, User } from 'lucide-react';
import type { DeliveryOrder } from '../../types/order';
import { formatCurrency } from '../../services/pricingService';
import { getOrderPaymentStatusLabel } from '../../utils/orderPaymentDisplay';
import {
  ORDER_STATUS_LABELS,
  formatOrderHistoryDate,
  getOrderStatusBadgeClass,
} from '../../utils/orderStatusDisplay';

export type OrderHistoryVariant = 'ESTABLISHMENT' | 'MOTOBOY' | 'CONDOMINIUM' | 'PLATFORM';

interface OrderHistoryCardProps {
  order: DeliveryOrder;
  variant: OrderHistoryVariant;
  isDark?: boolean;
}

function buildDetailLines(order: DeliveryOrder, variant: OrderHistoryVariant) {
  const recipient = {
    icon: User,
    text: `${order.recipientClientName ?? 'Cliente'}${
      order.recipientClientPhone ? ` · ${order.recipientClientPhone}` : ''
    }`,
  };
  const motoboy = {
    icon: Bike,
    text: order.acceptedMotoboyName ?? order.targetMotoboyName ?? 'Sem motoboy',
  };
  const establishment = { icon: Store, text: order.clientName };
  const condominium = order.condominiumName
    ? {
        icon: Building2,
        text: `${order.condominiumName}${
          order.condominiumUnitLabel ? ` · ${order.condominiumUnitLabel}` : ''
        }`,
      }
    : null;

  if (variant === 'MOTOBOY') return [establishment, recipient, condominium];
  if (variant === 'CONDOMINIUM') return [recipient, motoboy, establishment];
  if (variant === 'PLATFORM') return [establishment, motoboy, recipient];
  return [recipient, motoboy, condominium];
}

export function OrderHistoryCard({ order, variant, isDark = false }: OrderHistoryCardProps) {
  const mutedClass = isDark ? 'text-zinc-400' : 'text-slate-500';
  const detailLines = buildDetailLines(order, variant).filter(
    (line): line is { icon: typeof User; text: string } => line !== null,
  );

  return (
    <article
      className={`rounded-xl border p-4 ${
        isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold">{order.trackingCode}</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${getOrderStatusBadgeClass(
                order.status,
                isDark,
              )}`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className={`mt-1 text-xs ${mutedClass}`}>{formatOrderHistoryDate(order)}</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-black">{formatCurrency(order.price)}</p>
          <p className={`text-[11px] ${mutedClass}`}>{getOrderPaymentStatusLabel(order)}</p>
        </div>
      </div>

      <div className={`mt-3 space-y-1.5 text-xs ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
        <p className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0">
            {order.origin.address}
            <span className={mutedClass}> → </span>
            {order.destination.address}
          </span>
        </p>
        {detailLines.map(({ icon: Icon, text }) => (
          <p key={text} className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{text}</span>
          </p>
        ))}
        <p className={`text-[11px] ${mutedClass}`}>
          {order.distanceKm} km
          {order.tierLabel ? ` · ${order.tierLabel}` : ''}
        </p>
      </div>
    </article>
  );
}
