export const MAX_DOCUMENT_SIZE_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_DOCUMENT_MIME_PREFIXES = ['image/'];
export const ACCEPTED_DOCUMENT_MIME_TYPES = ['application/pdf'];

const THUMBNAIL_MAX_EDGE_PX = 240;
const THUMBNAIL_QUALITY = 0.6;

/**
 * URLs de objeto da sessão atual. O binário nunca é persistido: ao recarregar a
 * aba a pré-visualização em tamanho real deixa de existir (upload simulado).
 */
const sessionPreviewUrlByDocumentId = new Map<string, string>();

export function validateDocumentFile(file: File): string | null {
  const isAcceptedType =
    ACCEPTED_DOCUMENT_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix)) ||
    ACCEPTED_DOCUMENT_MIME_TYPES.includes(file.type);

  if (!isAcceptedType) {
    return 'Formato não suportado. Envie uma imagem (JPG/PNG) ou um PDF.';
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return 'Arquivo muito grande. O limite é 8 MB.';
  }

  return null;
}

export function isImageDocument(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

function calculateThumbnailSize(width: number, height: number): { width: number; height: number } {
  const largestEdge = Math.max(width, height);
  if (largestEdge <= THUMBNAIL_MAX_EDGE_PX) {
    return { width, height };
  }

  const scale = THUMBNAIL_MAX_EDGE_PX / largestEdge;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

/**
 * Gera uma miniatura JPEG reduzida para caber no localStorage. Retorna
 * undefined para PDFs ou quando o navegador falha ao decodificar a imagem.
 */
export async function createThumbnailDataUrl(file: File): Promise<string | undefined> {
  if (!isImageDocument(file.type)) return undefined;

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(objectUrl);
    const { width, height } = calculateThumbnailSize(image.naturalWidth, image.naturalHeight);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY);
  } catch {
    return undefined;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImageElement(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    image.src = source;
  });
}

/** Progresso fictício para a tela parecer um upload real na demonstração. */
export function simulateUploadProgress(onProgress: (percent: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const steps = [12, 34, 58, 79, 93, 100];
    let stepIndex = 0;

    const advance = () => {
      onProgress(steps[stepIndex]);
      stepIndex += 1;

      if (stepIndex >= steps.length) {
        resolve();
        return;
      }

      window.setTimeout(advance, 120 + Math.random() * 130);
    };

    advance();
  });
}

export function registerSessionPreview(documentId: string, file: File): void {
  revokeSessionPreview(documentId);
  sessionPreviewUrlByDocumentId.set(documentId, URL.createObjectURL(file));
}

export function getSessionPreviewUrl(documentId: string): string | undefined {
  return sessionPreviewUrlByDocumentId.get(documentId);
}

export function revokeSessionPreview(documentId: string): void {
  const existingUrl = sessionPreviewUrlByDocumentId.get(documentId);
  if (!existingUrl) return;

  URL.revokeObjectURL(existingUrl);
  sessionPreviewUrlByDocumentId.delete(documentId);
}

export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(0)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
