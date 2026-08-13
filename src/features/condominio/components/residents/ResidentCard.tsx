import { Check, Home, Pencil, Phone, RotateCcw, X } from 'lucide-react';
import type { ResidentLink } from '../../../../types/condominium';

interface ResidentCardProps {
  resident: ResidentLink;
  onApprove?: (resident: ResidentLink) => void;
  onReject?: (resident: ResidentLink) => void;
  onRevoke?: (resident: ResidentLink) => void;
  onEdit?: (resident: ResidentLink) => void;
}

const ORIGIN_LABELS: Record<ResidentLink['origin'], string> = {
  MANUAL: 'Cadastrado pela portaria',
  ORDER: 'Solicitado por uma entrega',
};

export function ResidentCard({
  resident,
  onApprove,
  onReject,
  onRevoke,
  onEdit,
}: ResidentCardProps) {
  const actionClass =
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{resident.name}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {resident.phone}
            </span>
            <span className="inline-flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              {resident.unitLabel}
            </span>
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {ORIGIN_LABELS[resident.origin]} ·{' '}
            {new Date(resident.requestedAt).toLocaleDateString('pt-BR')}
          </p>
          {resident.decisionNote && (
            <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
              {resident.decisionNote}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {onApprove && (
            <button
              type="button"
              onClick={() => onApprove(resident)}
              className={`${actionClass} bg-emerald-600 text-white hover:bg-emerald-700`}
            >
              <Check className="h-3.5 w-3.5" />
              Autorizar
            </button>
          )}
          {onReject && (
            <button
              type="button"
              onClick={() => onReject(resident)}
              className={`${actionClass} border border-slate-300 text-slate-600 hover:bg-slate-50`}
            >
              <X className="h-3.5 w-3.5" />
              Recusar
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(resident)}
              className={`${actionClass} border border-slate-300 text-slate-600 hover:bg-slate-50`}
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </button>
          )}
          {onRevoke && (
            <button
              type="button"
              onClick={() => onRevoke(resident)}
              className={`${actionClass} border border-red-200 text-red-600 hover:bg-red-50`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Revogar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
