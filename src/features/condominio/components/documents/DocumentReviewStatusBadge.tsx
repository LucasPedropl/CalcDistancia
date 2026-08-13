import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { CondominiumDocumentReviewStatus } from '../../../../types/condominium';

interface DocumentReviewStatusBadgeProps {
  status: CondominiumDocumentReviewStatus;
}

const STATUS_CONFIG: Record<
  CondominiumDocumentReviewStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  PENDING: {
    label: 'Aguardando análise',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: Clock,
  },
  APPROVED: {
    label: 'Aprovado',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejeitado',
    className: 'border-red-200 bg-red-50 text-red-700',
    icon: XCircle,
  },
};

export function DocumentReviewStatusBadge({ status }: DocumentReviewStatusBadgeProps) {
  const { label, className, icon: Icon } = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
