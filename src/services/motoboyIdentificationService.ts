import { getMotoboyById } from './motoboyService';
import { loadMotoboyProfile } from './motoboyProfileService';
import { normalizePhoneToE164 } from '../utils/phoneValidation';

export interface MotoboyQrPayload {
  motoboyId: string;
  cpf: string;
  name: string;
}

export function buildMotoboyQrPayload(motoboyId: string): MotoboyQrPayload | null {
  const motoboy = getMotoboyById(motoboyId);
  const profile = loadMotoboyProfile(motoboyId);
  if (!motoboy && !profile) return null;

  return {
    motoboyId,
    cpf: profile?.cpf?.replace(/\D/g, '') ?? '',
    name: profile?.nome ?? motoboy?.name ?? 'Motoboy',
  };
}

export function encodeMotoboyQrPayload(payload: MotoboyQrPayload): string {
  return `uaipdv://motoboy/${payload.motoboyId}?cpf=${payload.cpf}&name=${encodeURIComponent(payload.name)}`;
}

export function parseMotoboyQrPayload(raw: string): MotoboyQrPayload | null {
  const trimmed = raw.trim();

  try {
    if (trimmed.startsWith('{')) {
      const json = JSON.parse(trimmed) as MotoboyQrPayload;
      if (json.motoboyId) return json;
    }
  } catch {
    // not JSON
  }

  if (trimmed.startsWith('uaipdv://motoboy/')) {
    const url = new URL(trimmed);
    const motoboyId = url.pathname.replace('/motoboy/', '').replace(/^\//, '');
    const cpf = url.searchParams.get('cpf') ?? '';
    const name = decodeURIComponent(url.searchParams.get('name') ?? 'Motoboy');
    if (motoboyId) return { motoboyId, cpf, name };
  }

  if (/^\d{11}$/.test(trimmed.replace(/\D/g, ''))) {
    const cpf = trimmed.replace(/\D/g, '');
    const found = findMotoboyByCpf(cpf);
    if (found) return found;
  }

  return findMotoboyByPhone(trimmed);
}

export function findMotoboyByPhone(phone: string): MotoboyQrPayload | null {
  const normalized = normalizePhoneToE164(phone).replace(/\D/g, '');
  const demoIds = ['mb-001', 'mb-002', 'mb-003', 'mb-004', 'mb-005', 'mb-006'];

  for (const id of demoIds) {
    const profile = loadMotoboyProfile(id);
    if (!profile?.telefone) continue;
    const profilePhone = normalizePhoneToE164(profile.telefone).replace(/\D/g, '');
    if (profilePhone.endsWith(normalized.slice(-11)) || profilePhone.endsWith(normalized.slice(-10))) {
      return buildMotoboyQrPayload(id);
    }
  }

  return null;
}

export function findMotoboyByCpf(cpf: string): MotoboyQrPayload | null {
  const clean = cpf.replace(/\D/g, '');
  const demoIds = ['mb-001', 'mb-002', 'mb-003', 'mb-004', 'mb-005', 'mb-006'];

  for (const id of demoIds) {
    const profile = loadMotoboyProfile(id);
    if (profile?.cpf?.replace(/\D/g, '') === clean) {
      return buildMotoboyQrPayload(id);
    }
  }

  return null;
}

export function resolveMotoboyDisplayName(payload: MotoboyQrPayload): string {
  const motoboy = getMotoboyById(payload.motoboyId);
  const profile = loadMotoboyProfile(payload.motoboyId);
  return profile?.nome ?? motoboy?.name ?? payload.name;
}
