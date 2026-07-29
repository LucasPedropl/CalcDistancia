import { BIXS_API_ROUTES, getBixsAuthPayload } from '../constants/bixsApi';
import { resolvePhoneForEnvironment } from '../utils/phoneValidation';

export interface BixsInstance {
  id: number;
  name?: string;
  status?: string;
}

export interface SendWhatsAppMessageParams {
  instanceId: number;
  to: string;
  toName: string;
  message: string;
  documentUrl?: string;
}

async function parseApiError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string; message?: string };
    return body.error ?? body.message ?? fallback;
  } catch {
    return `${fallback} (HTTP ${response.status})`;
  }
}

export async function loginBixs(): Promise<string> {
  const response = await fetch(BIXS_API_ROUTES.authLogin, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(getBixsAuthPayload()),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Falha ao autenticar na API Bixs'));
  }

  const data = (await response.json()) as { token?: string; access_token?: string };
  const token = data.token ?? data.access_token;

  if (!token) {
    throw new Error('Token não retornado pela API Bixs');
  }

  return token;
}

export async function listInstances(token: string): Promise<BixsInstance[]> {
  const response = await fetch(BIXS_API_ROUTES.instances, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Falha ao buscar instâncias WhatsApp'));
  }

  return (await response.json()) as BixsInstance[];
}

export async function getInstanceStatus(token: string, instanceId: number): Promise<string> {
  const response = await fetch(`${BIXS_API_ROUTES.instances}/${instanceId}/status`, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Falha ao consultar status da instância'));
  }

  const data = (await response.json()) as { status?: string };
  return data.status ?? '';
}

export function isInstanceConnected(status: string): boolean {
  const normalized = status.toUpperCase();
  return normalized === 'OPEN' || normalized === 'CONNECTED';
}

export async function getInstanceQrCode(token: string, instanceId: number): Promise<string> {
  const response = await fetch(`${BIXS_API_ROUTES.instances}/${instanceId}/qrcode`, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Falha ao obter QR Code'));
  }

  const qrData = await response.json();

  if (typeof qrData === 'string') return qrData;

  const record = qrData as { qrcode?: string; code?: string; base64?: string };
  return record.qrcode ?? record.code ?? record.base64 ?? JSON.stringify(qrData);
}

export async function createInstance(token: string, name: string): Promise<number> {
  const response = await fetch(BIXS_API_ROUTES.instances, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Falha ao criar instância WhatsApp'));
  }

  const data = (await response.json()) as { id: number };
  return data.id;
}

export async function deleteInstance(token: string, instanceId: number): Promise<void> {
  const response = await fetch(`${BIXS_API_ROUTES.instances}/${instanceId}`, {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Falha ao excluir instância WhatsApp'));
  }
}

export async function uploadMedia(token: string, blob: Blob, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, filename);

  const response = await fetch(BIXS_API_ROUTES.uploadMedia, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Falha no upload de mídia'));
  }

  const data = (await response.json()) as { media_url?: string };
  if (!data.media_url) {
    throw new Error('URL da mídia não retornada pela API');
  }

  return data.media_url;
}

export async function sendWhatsAppMessage(
  token: string,
  { instanceId, to, toName, message, documentUrl }: SendWhatsAppMessageParams,
): Promise<void> {
  const payload = {
    audio_url: '',
    document_url: documentUrl ?? '',
    image_url: '',
    instance_id: instanceId,
    message,
    to: resolvePhoneForEnvironment(to),
    to_name: toName,
    video_url: '',
  };

  const response = await fetch(BIXS_API_ROUTES.messagesSend, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Falha ao enviar mensagem WhatsApp'));
  }
}

export async function getActiveInstanceId(token: string): Promise<number> {
  const instances = await listInstances(token);

  if (!instances.length) {
    throw new Error(
      'Nenhuma instância WhatsApp conectada. Acesse o painel administrativo e conecte o WhatsApp da empresa.',
    );
  }

  return instances[0].id;
}

export async function assertWhatsAppConnected(token: string): Promise<number> {
  const instanceId = await getActiveInstanceId(token);
  const status = await getInstanceStatus(token, instanceId);

  if (!isInstanceConnected(status)) {
    throw new Error(
      'WhatsApp da empresa não está conectado. Acesse o painel administrativo e escaneie o QR Code.',
    );
  }

  return instanceId;
}
