import { FileText, ImageIcon } from 'lucide-react';
import type { CondominiumDocument } from '../../../../types/condominium';
import { getSessionPreviewUrl, isImageDocument } from '../../../../services/documentUploadSimulator';

interface DocumentPreviewProps {
  document: CondominiumDocument;
  className?: string;
}

export function DocumentPreview({ document, className = '' }: DocumentPreviewProps) {
  const sessionUrl = getSessionPreviewUrl(document.id);
  const thumbnail = document.thumbnailDataUrl;
  const isImage = isImageDocument(document.mimeType);

  const frameClass = `flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${className}`;

  if (thumbnail) {
    const image = (
      <img src={thumbnail} alt={document.fileName} className="h-full w-full object-cover" />
    );

    return sessionUrl ? (
      <a
        href={sessionUrl}
        target="_blank"
        rel="noreferrer"
        className={frameClass}
        title="Abrir arquivo original (disponível somente nesta sessão)"
      >
        {image}
      </a>
    ) : (
      <div className={frameClass}>{image}</div>
    );
  }

  const Icon = isImage ? ImageIcon : FileText;
  const placeholder = (
    <div className="flex flex-col items-center gap-1 text-slate-400">
      <Icon className="h-7 w-7" />
      <span className="text-[10px] font-semibold uppercase">{isImage ? 'Imagem' : 'PDF'}</span>
    </div>
  );

  return sessionUrl ? (
    <a
      href={sessionUrl}
      target="_blank"
      rel="noreferrer"
      className={frameClass}
      title="Abrir arquivo original (disponível somente nesta sessão)"
    >
      {placeholder}
    </a>
  ) : (
    <div className={frameClass}>{placeholder}</div>
  );
}
