/** Situação do condomínio no processo de parceria (análise documental). */
export type CondominiumPartnerStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type CondominiumDocumentType =
  | 'ASSEMBLY_MINUTES'
  | 'PRESIDENT_ID'
  | 'CNPJ_CARD'
  | 'ADDRESS_PROOF'
  | 'OTHER';

export type CondominiumDocumentReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CondominiumDocument {
  id: string;
  condominiumId: string;
  type: CondominiumDocumentType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  reviewStatus: CondominiumDocumentReviewStatus;
  reviewNote?: string;
  /** Miniatura reduzida gerada no upload simulado (imagens apenas). */
  thumbnailDataUrl?: string;
}

export type ResidentLinkStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';

/** Origem da solicitação: criada pelo condomínio ou disparada por um pedido. */
export type ResidentLinkOrigin = 'MANUAL' | 'ORDER';

export interface ResidentLink {
  id: string;
  condominiumId: string;
  name: string;
  phone: string;
  unitLabel: string;
  documentNumber?: string;
  status: ResidentLinkStatus;
  origin: ResidentLinkOrigin;
  requestedAt: string;
  decidedAt?: string;
  decisionNote?: string;
}

export type CondominiumVisitAuthorizationMethod = 'PARTNER_AUTH' | 'CONVENTIONAL';

export interface CondominiumVisit {
  id: string;
  condominiumId: string;
  orderId: string;
  motoboyId?: string;
  motoboyName: string;
  residentName: string;
  unitLabel?: string;
  destinationAddress: string;
  authorizationMethod: CondominiumVisitAuthorizationMethod;
  enteredAt: string;
  exitedAt?: string;
}

export interface CondominiumPlan {
  id: string;
  name: string;
  description: string;
  monthlyPriceCents: number;
  /** null = entregas ilimitadas */
  includedDeliveries: number | null;
  features: string[];
  isActive: boolean;
}

/** Estado da autorização do morador para uma entrega específica. */
export type ResidentAuthorizationStatus = 'AUTHORIZED' | 'PENDING' | 'CONVENTIONAL';

export const CONDOMINIUM_DOCUMENT_LABELS: Record<CondominiumDocumentType, string> = {
  ASSEMBLY_MINUTES: 'Ata da assembleia',
  PRESIDENT_ID: 'Identidade do presidente/síndico',
  CNPJ_CARD: 'Cartão CNPJ do condomínio',
  ADDRESS_PROOF: 'Comprovante de endereço',
  OTHER: 'Outro documento',
};

export const REQUIRED_CONDOMINIUM_DOCUMENT_TYPES: CondominiumDocumentType[] = [
  'ASSEMBLY_MINUTES',
  'PRESIDENT_ID',
  'CNPJ_CARD',
  'ADDRESS_PROOF',
];

export const CONDOMINIUM_PARTNER_STATUS_LABELS: Record<CondominiumPartnerStatus, string> = {
  DRAFT: 'Cadastro incompleto',
  PENDING_REVIEW: 'Em análise',
  APPROVED: 'Parceiro',
  REJECTED: 'Rejeitado',
  SUSPENDED: 'Suspenso',
};
