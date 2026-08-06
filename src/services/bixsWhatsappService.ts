import { BIXS_API_ROUTES, getBixsAuthPayload } from '../constants/bixsApi';
import { resolvePhoneForEnvironment } from '../utils/phoneValidation';

export interface BixsInstance {
  id: number;
  name?: string;
  status?: string;
  phone_number?: string;
}

export interface BixsSendMessageResponse {
  success?: boolean;
  id?: string;
  message?: string;
  error?: string;
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
    const raw = body.error ?? body.message ?? fallback;
    return mapBixsWhatsappError(raw);
  } catch {
    return `${fallback} (HTTP ${response.status})`;
  }
}

function mapBixsWhatsappError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('error 463') || normalized.includes('463')) {
    return 'O WhatsApp não conseguiu entregar para este número. Confirme se ele tem WhatsApp ativo e se aceita mensagens de contas comerciais.';
  }

  if (normalized.includes('not connected') || normalized.includes('disconnected')) {
    return 'WhatsApp da empresa desconectou. Acesse o painel admin e escaneie o QR Code novamente.';
  }

  return message;
}

function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

function phonesAreEquivalent(phoneA: string, phoneB: string): boolean {
  const a = normalizePhoneDigits(phoneA);
  const b = normalizePhoneDigits(phoneB);
  if (!a || !b) return false;
  if (a === b) return true;

  const stripCountry = (value: string) => (value.startsWith('55') ? value.slice(2) : value);
  const localA = stripCountry(a);
  const localB = stripCountry(b);
  if (localA === localB) return true;

  return localA.endsWith(localB) || localB.endsWith(localA);
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

  const data = (await response.json()) as BixsSendMessageResponse;
  if (data.success === false) {
    throw new Error(mapBixsWhatsappError(data.message ?? data.error ?? 'Falha ao enviar mensagem WhatsApp'));
  }
}

export async function getConnectedInstance(token: string): Promise<BixsInstance> {
  const instances = await listInstances(token);

  if (!instances.length) {
    throw new Error(
      'Nenhuma instância WhatsApp conectada. Acesse o painel administrativo e conecte o WhatsApp da empresa.',
    );
  }

  const connectedFromList = instances.find((instance) => isInstanceConnected(instance.status ?? ''));
  if (connectedFromList) {
    return connectedFromList;
  }

  for (const instance of instances) {
    const status = await getInstanceStatus(token, instance.id);
    if (isInstanceConnected(status)) {
      return { ...instance, status };
    }
  }

  throw new Error(
    'WhatsApp da empresa não está conectado. Acesse o painel administrativo e escaneie o QR Code.',
  );
}

export async function getConnectedInstancePhone(token: string): Promise<string | null> {
  const instance = await getConnectedInstance(token);
  return instance.phone_number ?? null;
}

export function assertRecipientDiffersFromConnectedPhone(
  recipientPhone: string,
  connectedPhone: string | null | undefined,
): void {
  if (!connectedPhone) return;

  if (phonesAreEquivalent(recipientPhone, connectedPhone)) {
    throw new Error(
      'O telefone do destinatário é o mesmo número conectado no painel admin. O WhatsApp da empresa não pode enviar mensagem para si mesmo — informe o telefone do cliente final.',
    );
  }
}

export async function getActiveInstanceId(token: string): Promise<number> {
  const instance = await getConnectedInstance(token);
  return instance.id;
}

export async function assertWhatsAppConnected(token: string): Promise<number> {
  const instance = await getConnectedInstance(token);
  return instance.id;
}
