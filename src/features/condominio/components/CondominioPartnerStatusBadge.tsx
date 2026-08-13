import { AlertTriangle, BadgeCheck, Clock, FileWarning, ShieldOff } from 'lucide-react';
import type { CondominiumPartnerStatus } from '../../../types/condominium';
import { CONDOMINIUM_PARTNER_STATUS_LABELS } from '../../../types/condominium';

interface CondominioPartnerStatusBadgeProps {
  status: CondominiumPartnerStatus;
  className?: string;
}

const STATUS_STYLES: Record<CondominiumPartnerStatus, string> = {
  DRAFT: 'border-slate-200 bg-slate-100 text-slate-600',
  PENDING_REVIEW: 'border-amber-200 bg-amber-50 text-amber-700',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-red-200 bg-red-50 text-red-700',
  SUSPENDED: 'border-orange-200 bg-orange-50 text-orange-700',
};

const STATUS_ICONS: Record<CondominiumPartnerStatus, typeof BadgeCheck> = {
  DRAFT: FileWarning,
  PENDING_REVIEW: Clock,
  APPROVED: BadgeCheck,
  REJECTED: AlertTriangle,
  SUSPENDED: ShieldOff,
};

export function CondominioPartnerStatusBadge({
  status,
  className = '',
}: CondominioPartnerStatusBadgeProps) {
  const Icon = STATUS_ICONS[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {CONDOMINIUM_PARTNER_STATUS_LABELS[status]}
    </span>
  );
}
