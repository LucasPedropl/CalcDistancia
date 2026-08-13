import { Check, X } from 'lucide-react';
import type { CondominiumDocument } from '../../../../types/condominium';
import { CONDOMINIUM_DOCUMENT_LABELS } from '../../../../types/condominium';
import { reviewCondominiumDocument } from '../../../../services/condominiumDocumentService';
import { formatFileSize } from '../../../../services/documentUploadSimulator';
import { DocumentPreview } from '../../../condominio/components/documents/DocumentPreview';
import { DocumentReviewStatusBadge } from '../../../condominio/components/documents/DocumentReviewStatusBadge';

interface AdminCondominiumDocumentsReviewProps {
  documents: CondominiumDocument[];
  onRequestReject: (documentId: string) => void;
}

export function AdminCondominiumDocumentsReview({
  documents,
  onRequestReject,
}: AdminCondominiumDocumentsReviewProps) {
  if (documents.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-xs text-slate-500">
        Nenhum documento enviado pelo condomínio.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <div key={document.id} className="rounded-xl border border-slate-200 p-3">
          <div className="flex items-start gap-3">
            <DocumentPreview document={document} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900">
                {CONDOMINIUM_DOCUMENT_LABELS[document.type]}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{document.fileName}</p>
              <p className="text-[11px] text-slate-400">
                {formatFileSize(document.sizeBytes)} ·{' '}
                {new Date(document.uploadedAt).toLocaleDateString('pt-BR')}
              </p>
              <div className="mt-2">
                <DocumentReviewStatusBadge status={document.reviewStatus} />
              </div>
              {document.reviewNote && (
                <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] text-red-700">
                  {document.reviewNote}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => reviewCondominiumDocument(document.id, 'APPROVED')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
            >
              <Check className="h-3.5 w-3.5" />
              Aprovar
            </button>
            <button
              type="button"
              onClick={() => onRequestReject(document.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" />
              Rejeitar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
