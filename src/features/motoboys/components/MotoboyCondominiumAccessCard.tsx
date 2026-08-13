import { Building2, DoorOpen, ShieldCheck } from 'lucide-react';
import type { DeliveryOrder } from '../../../types/order';
import type { ResidentAuthorizationStatus } from '../../../types/condominium';

interface MotoboyCondominiumAccessCardProps {
  order: DeliveryOrder;
  isDark: boolean;
}

const ACCESS_MESSAGES: Record<ResidentAuthorizationStatus, string> = {
  AUTHORIZED: 'Morador autorizado pelo condomínio. Entrada liberada na portaria.',
  PENDING:
    'Autorização do morador ainda pendente. Faça a identificação convencional na portaria.',
  CONVENTIONAL:
    'Condomínio não parceiro. Faça a identificação convencional na portaria.',
};

export function MotoboyCondominiumAccessCard({
  order,
  isDark,
}: MotoboyCondominiumAccessCardProps) {
  if (!order.condominiumId || !order.condominiumName) return null;

  const status = order.residentAuthorizationStatus ?? 'CONVENTIONAL';
  const isAuthorized = status === 'AUTHORIZED';
  const Icon = isAuthorized ? ShieldCheck : DoorOpen;

  const containerClass = isAuthorized
    ? isDark
      ? 'border-emerald-900 bg-emerald-950/40 text-emerald-300'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : isDark
      ? 'border-amber-900 bg-amber-950/30 text-amber-300'
      : 'border-amber-200 bg-amber-50 text-amber-800';

  return (
    <div className={`mt-3 rounded-xl border p-3 text-xs ${containerClass}`}>
      <p className="flex items-center gap-1.5 font-bold">
        <Building2 className="h-3.5 w-3.5" />
        {order.condominiumName}
        {order.condominiumUnitLabel && (
          <span className="font-semibold opacity-80">· {order.condominiumUnitLabel}</span>
        )}
      </p>
      <p className="mt-1.5 flex items-start gap-1.5 leading-relaxed">
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {ACCESS_MESSAGES[status]}
      </p>
    </div>
  );
}
