import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Building2, ShieldOff, X } from 'lucide-react';
import type { CondominiumProfile } from '../../../../services/condominiumService';
import { useCondominiumDocuments, useCondominiumPlans } from '../../../../hooks/useCondominium';
import { reviewCondominiumDocument } from '../../../../services/condominiumDocumentService';
import {
  approveCondominium,
  rejectCondominium,
  setCondominiumPartnerStatus,
} from '../../../../services/condominiumPartnerService';
import { formatPlanPrice } from '../../../../services/condominiumPlanService';
import { ReasonPromptModal } from '../../../../components/ReasonPromptModal';
import { CondominioPartnerStatusBadge } from '../../../condominio/components/CondominioPartnerStatusBadge';
import { AdminCondominiumDocumentsReview } from './AdminCondominiumDocumentsReview';

interface AdminCondominiumDetailDrawerProps {
  condominium: CondominiumProfile;
  adminId: string;
  onClose: () => void;
}

type PendingDecision = { kind: 'CONDOMINIUM' } | { kind: 'DOCUMENT'; documentId: string };

export function AdminCondominiumDetailDrawer({
  condominium,
  adminId,
  onClose,
}: AdminCondominiumDetailDrawerProps) {
  const documents = useCondominiumDocuments(condominium.userId);
  const plans = useCondominiumPlans();
  const [selectedPlanId, setSelectedPlanId] = useState(condominium.planId ?? '');
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null);

  const handleReject = (reason: string) => {
    if (!pendingDecision) return;

    if (pendingDecision.kind === 'CONDOMINIUM') {
      rejectCondominium(condominium.userId, adminId, reason);
      setPendingDecision(null);
      onClose();
      return;
    }

    reviewCondominiumDocument(pendingDecision.documentId, 'REJECTED', reason);
    setPendingDecision(null);
  };

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Building2 className="h-4 w-4" />
              Análise de parceria
            </p>
            <h3 className="mt-1 truncate text-lg font-bold text-slate-900">{condominium.name}</h3>
            <CondominioPartnerStatusBadge status={condominium.partnerStatus} className="mt-2" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <dl className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
            <DetailRow label="Endereço" value={condominium.address.address} />
            <DetailRow label="CNPJ" value={condominium.cnpj ?? 'Não informado'} />
            <DetailRow
              label="Unidades"
              value={condominium.unitsCount ? `${condominium.unitsCount}` : 'Não informado'}
            />
            <DetailRow label="Síndico" value={condominium.presidentName ?? 'Não informado'} />
            <DetailRow label="Telefone" value={condominium.presidentPhone ?? 'Não informado'} />
            <DetailRow label="E-mail" value={condominium.presidentEmail ?? 'Não informado'} />
          </dl>

          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Documentos ({documents.length})
            </h4>
            <AdminCondominiumDocumentsReview
              documents={documents}
              onRequestReject={(documentId) => setPendingDecision({ kind: 'DOCUMENT', documentId })}
            />
          </section>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Plano vinculado
            </span>
            <select
              value={selectedPlanId}
              onChange={(event) => setSelectedPlanId(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
            >
              <option value="">Sem plano</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} · {formatPlanPrice(plan.monthlyPriceCents)}/mês
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={() => {
              approveCondominium(condominium.userId, adminId, selectedPlanId || undefined);
              onClose();
            }}
            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            Aprovar parceria
          </button>
          <button
            type="button"
            onClick={() => setPendingDecision({ kind: 'CONDOMINIUM' })}
            className="flex-1 rounded-xl border border-red-200 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
          >
            Rejeitar
          </button>
          {condominium.partnerStatus === 'APPROVED' && (
            <button
              type="button"
              onClick={() => {
                setCondominiumPartnerStatus(condominium.userId, 'SUSPENDED', adminId);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <ShieldOff className="h-4 w-4" />
              Suspender
            </button>
          )}
        </div>
      </div>

      {pendingDecision && (
        <ReasonPromptModal
          title={pendingDecision.kind === 'CONDOMINIUM' ? 'Rejeitar parceria' : 'Rejeitar documento'}
          description="O motivo fica visível para o condomínio na tela de documentos."
          confirmLabel="Rejeitar"
          onCancel={() => setPendingDecision(null)}
          onConfirm={handleReject}
        />
      )}
    </div>,
    document.body,
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-slate-700">{value}</dd>
    </div>
  );
}
