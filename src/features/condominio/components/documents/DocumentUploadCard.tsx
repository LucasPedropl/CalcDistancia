import { useRef, useState } from 'react';
import { AlertCircle, Info, Trash2, Upload } from 'lucide-react';
import type { CondominiumDocument, CondominiumDocumentType } from '../../../../types/condominium';
import { CONDOMINIUM_DOCUMENT_LABELS } from '../../../../types/condominium';
import {
  removeCondominiumDocument,
  uploadCondominiumDocument,
} from '../../../../services/condominiumDocumentService';
import {
  formatFileSize,
  getSessionPreviewUrl,
} from '../../../../services/documentUploadSimulator';
import { DocumentPreview } from './DocumentPreview';
import { DocumentReviewStatusBadge } from './DocumentReviewStatusBadge';

interface DocumentUploadCardProps {
  condominiumId: string;
  type: CondominiumDocumentType;
  helperText: string;
  document?: CondominiumDocument;
  isLocked: boolean;
}

export function DocumentUploadCard({
  condominiumId,
  type,
  helperText,
  document,
  isLocked,
}: DocumentUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isUploading = uploadProgress !== null;

  const handleFile = async (file: File | undefined) => {
    if (!file || isLocked) return;

    setError(null);
    setNotice(null);
    setUploadProgress(0);

    try {
      const result = await uploadCondominiumDocument({
        condominiumId,
        type,
        file,
        onProgress: setUploadProgress,
      });

      if (result.thumbnailDiscarded) {
        setNotice('Miniatura não armazenada por limite de espaço. O registro do envio foi mantido.');
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Falha ao enviar o documento.');
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    if (!document || isLocked) return;
    removeCondominiumDocument(document.id);
    setNotice(null);
    setError(null);
  };

  const hasSessionPreview = document ? Boolean(getSessionPreviewUrl(document.id)) : false;

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!isLocked) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        void handleFile(event.dataTransfer.files[0]);
      }}
      className={`rounded-2xl border bg-white p-4 transition-colors sm:p-5 ${
        isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900">{CONDOMINIUM_DOCUMENT_LABELS[type]}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{helperText}</p>
        </div>
        {document && <DocumentReviewStatusBadge status={document.reviewStatus} />}
      </div>

      {document ? (
        <div className="mt-4 flex items-start gap-3">
          <DocumentPreview document={document} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{document.fileName}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatFileSize(document.sizeBytes)} ·{' '}
              {new Date(document.uploadedAt).toLocaleString('pt-BR')}
            </p>
            {!hasSessionPreview && (
              <p className="mt-1 flex items-start gap-1.5 text-[11px] text-slate-400">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                Pré-visualização em tamanho real indisponível após recarregar (upload simulado).
              </p>
            )}
            {document.reviewNote && (
              <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
                {document.reviewNote}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
          Arraste o arquivo aqui ou use o botão abaixo. JPG, PNG ou PDF de até 8 MB.
        </p>
      )}

      {isUploading && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Enviando... {uploadProgress}%</p>
        </div>
      )}

      {error && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {notice && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {notice}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <button
          type="button"
          disabled={isLocked || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {document ? 'Substituir arquivo' : 'Selecionar arquivo'}
        </button>
        {document && (
          <button
            type="button"
            disabled={isLocked || isUploading}
            onClick={handleRemove}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
