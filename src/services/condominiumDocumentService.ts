import type {
  CondominiumDocument,
  CondominiumDocumentReviewStatus,
  CondominiumDocumentType,
} from '../types/condominium';
import { REQUIRED_CONDOMINIUM_DOCUMENT_TYPES } from '../types/condominium';
import { createLocalCollectionStore, generateEntityId } from './localCollectionStore';
import {
  createThumbnailDataUrl,
  registerSessionPreview,
  revokeSessionPreview,
  simulateUploadProgress,
  validateDocumentFile,
} from './documentUploadSimulator';

const documentStore = createLocalCollectionStore<CondominiumDocument>(
  'calc_distancia_condo_documents',
);

/** Teto de miniaturas por condomínio para não estourar a cota do localStorage. */
const MAX_THUMBNAIL_BYTES_PER_CONDOMINIUM = 120 * 1024;

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

/**
 * Grava a coleção tolerando estouro de cota: na falha, descarta as miniaturas
 * e regrava apenas os metadados, que é o mínimo para a tela continuar coerente.
 */
function safeWriteDocuments(documents: CondominiumDocument[]): boolean {
  try {
    documentStore.writeAll(documents);
    return true;
  } catch (error) {
    if (!isQuotaExceededError(error)) throw error;

    const withoutThumbnails = documents.map(({ thumbnailDataUrl: _ignored, ...rest }) => rest);
    documentStore.writeAll(withoutThumbnails);
    return false;
  }
}

function measureThumbnailBytes(documents: CondominiumDocument[]): number {
  return documents.reduce((total, document) => total + (document.thumbnailDataUrl?.length ?? 0), 0);
}

export function listCondominiumDocuments(condominiumId: string): CondominiumDocument[] {
  return documentStore
    .readAll()
    .filter((document) => document.condominiumId === condominiumId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export function getCondominiumDocumentByType(
  condominiumId: string,
  type: CondominiumDocumentType,
): CondominiumDocument | undefined {
  return listCondominiumDocuments(condominiumId).find((document) => document.type === type);
}

export interface UploadCondominiumDocumentInput {
  condominiumId: string;
  type: CondominiumDocumentType;
  file: File;
  onProgress?: (percent: number) => void;
}

export interface UploadCondominiumDocumentResult {
  document: CondominiumDocument;
  thumbnailDiscarded: boolean;
}

/**
 * Upload simulado: valida, gera miniatura, anima o progresso e persiste apenas
 * o metadado. O arquivo original só fica acessível na sessão atual.
 */
export async function uploadCondominiumDocument(
  input: UploadCondominiumDocumentInput,
): Promise<UploadCondominiumDocumentResult> {
  const validationError = validateDocumentFile(input.file);
  if (validationError) {
    throw new Error(validationError);
  }

  const thumbnailDataUrl = await createThumbnailDataUrl(input.file);
  await simulateUploadProgress(input.onProgress ?? (() => {}));

  const documents = documentStore.readAll();
  const previous = documents.find(
    (document) => document.condominiumId === input.condominiumId && document.type === input.type,
  );
  if (previous) {
    revokeSessionPreview(previous.id);
  }

  const remaining = documents.filter(
    (document) =>
      !(document.condominiumId === input.condominiumId && document.type === input.type),
  );

  const usedThumbnailBytes = measureThumbnailBytes(
    remaining.filter((document) => document.condominiumId === input.condominiumId),
  );
  const fitsThumbnailBudget =
    usedThumbnailBytes + (thumbnailDataUrl?.length ?? 0) <= MAX_THUMBNAIL_BYTES_PER_CONDOMINIUM;

  const document: CondominiumDocument = {
    id: generateEntityId('DOC'),
    condominiumId: input.condominiumId,
    type: input.type,
    fileName: input.file.name,
    mimeType: input.file.type,
    sizeBytes: input.file.size,
    uploadedAt: new Date().toISOString(),
    reviewStatus: 'PENDING',
    thumbnailDataUrl: fitsThumbnailBudget ? thumbnailDataUrl : undefined,
  };

  const persistedWithThumbnail = safeWriteDocuments([...remaining, document]);
  registerSessionPreview(document.id, input.file);

  return {
    document,
    thumbnailDiscarded: Boolean(thumbnailDataUrl) && (!fitsThumbnailBudget || !persistedWithThumbnail),
  };
}

export function removeCondominiumDocument(documentId: string): void {
  revokeSessionPreview(documentId);
  const remaining = documentStore.readAll().filter((document) => document.id !== documentId);
  safeWriteDocuments(remaining);
}

export function reviewCondominiumDocument(
  documentId: string,
  reviewStatus: CondominiumDocumentReviewStatus,
  reviewNote?: string,
): CondominiumDocument | null {
  const documents = documentStore.readAll();
  const documentIndex = documents.findIndex((document) => document.id === documentId);
  if (documentIndex === -1) return null;

  const updated: CondominiumDocument = {
    ...documents[documentIndex],
    reviewStatus,
    reviewNote: reviewNote?.trim() ? reviewNote.trim() : undefined,
  };

  documents[documentIndex] = updated;
  safeWriteDocuments(documents);
  return updated;
}

export interface RequiredDocumentSlot {
  type: CondominiumDocumentType;
  document?: CondominiumDocument;
}

export function getRequiredDocumentsStatus(condominiumId: string): RequiredDocumentSlot[] {
  const documents = listCondominiumDocuments(condominiumId);

  return REQUIRED_CONDOMINIUM_DOCUMENT_TYPES.map((type) => ({
    type,
    document: documents.find((document) => document.type === type),
  }));
}

export function areRequiredDocumentsComplete(condominiumId: string): boolean {
  return getRequiredDocumentsStatus(condominiumId).every((slot) => Boolean(slot.document));
}

export function areRequiredDocumentsApproved(condominiumId: string): boolean {
  return getRequiredDocumentsStatus(condominiumId).every(
    (slot) => slot.document?.reviewStatus === 'APPROVED',
  );
}

export function subscribeToCondominiumDocuments(listener: () => void): () => void {
  return documentStore.subscribe(listener);
}
