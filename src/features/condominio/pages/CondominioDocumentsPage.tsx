import { useState } from 'react';
import { AlertCircle, CheckCircle2, Send, ShieldCheck } from 'lucide-react';
import type { CondominiumProfile } from '../../../services/condominiumService';
import type { CondominiumDocumentType } from '../../../types/condominium';
import { REQUIRED_CONDOMINIUM_DOCUMENT_TYPES } from '../../../types/condominium';
import { useCondominiumDocuments } from '../../../hooks/useCondominium';
import { submitCondominiumForReview } from '../../../services/condominiumPartnerService';
import { CondominioPageContainer } from '../components/CondominioPageContainer';
import { DocumentUploadCard } from '../components/documents/DocumentUploadCard';

interface CondominioDocumentsPageProps {
  profile: CondominiumProfile;
}

const DOCUMENT_HELPER_TEXTS: Record<CondominiumDocumentType, string> = {
  ASSEMBLY_MINUTES:
    'Ata registrada que elegeu o síndico ou presidente atual. Usada para comprovar a representação legal.',
  PRESIDENT_ID:
    'RG ou CNH do presidente/síndico, legível e dentro da validade.',
  CNPJ_CARD: 'Cartão CNPJ do condomínio emitido pela Receita Federal.',
  ADDRESS_PROOF: 'Conta de consumo recente em nome do condomínio, com o endereço da portaria.',
  OTHER: 'Documento complementar solicitado pela análise.',
};

export function CondominioDocumentsPage({ profile }: CondominioDocumentsPageProps) {
  const documents = useCondominiumDocuments(profile.userId);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUnderReview = profile.partnerStatus === 'PENDING_REVIEW';
  const isApproved = profile.partnerStatus === 'APPROVED';
  const missingCount = REQUIRED_CONDOMINIUM_DOCUMENT_TYPES.filter(
    (type) => !documents.some((document) => document.type === type),
  ).length;

  const handleSubmitForReview = () => {
    setError(null);
    setIsSubmitting(true);

    try {
      submitCondominiumForReview(profile.userId);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Não foi possível enviar para análise.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CondominioPageContainer
      title="Documentos do empreendimento"
      description="Envie os documentos que comprovam a existência do condomínio e a representação legal do síndico. A retaguarda analisa e libera a parceria."
    >
      {profile.rejectionReason && (
        <p className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Cadastro rejeitado:</strong> {profile.rejectionReason}
          </span>
        </p>
      )}

      {isApproved && (
        <p className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Condomínio aprovado como parceiro. Ele já aparece para os estabelecimentos ao criar
          entregas na região.
        </p>
      )}

      {isUnderReview && (
        <p className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Documentos enviados. A análise da retaguarda está em andamento e os arquivos ficam
          bloqueados para alteração.
        </p>
      )}

      <div className="grid gap-4">
        {REQUIRED_CONDOMINIUM_DOCUMENT_TYPES.map((type) => (
          <DocumentUploadCard
            key={type}
            condominiumId={profile.userId}
            type={type}
            helperText={DOCUMENT_HELPER_TEXTS[type]}
            document={documents.find((document) => document.type === type)}
            isLocked={isUnderReview}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">Solicitar análise da parceria</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {missingCount > 0
            ? `Faltam ${missingCount} documento(s) obrigatório(s) para enviar o cadastro.`
            : 'Todos os documentos obrigatórios foram enviados. Você pode solicitar a análise.'}
        </p>

        {error && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmitForReview}
          disabled={missingCount > 0 || isUnderReview || isSubmitting}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {isUnderReview ? 'Em análise' : isSubmitting ? 'Enviando...' : 'Enviar para análise'}
        </button>
      </div>
    </CondominioPageContainer>
  );
}
