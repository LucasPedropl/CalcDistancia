import type { LocationPoint } from '../types';

const PROFILE_KEY_PREFIX = 'calc_distancia_client_profile_';

export interface ClientProfile {
  userId: string;
  phone: string;
  homeAddress: LocationPoint | null;
}

const DEFAULT_DEMO_PHONES: Record<string, string> = {
  'consumidor-cliente-exemplo-com': '(27) 99999-0001',
};

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function loadClientProfile(userId: string): ClientProfile {
  try {
    const raw = localStorage.getItem(`${PROFILE_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw) as ClientProfile;
    }
  } catch {
    // ignore
  }

  return {
    userId,
    phone: DEFAULT_DEMO_PHONES[userId] ?? '',
    homeAddress: null,
  };
}

export function saveClientProfile(profile: ClientProfile): void {
  localStorage.setItem(`${PROFILE_KEY_PREFIX}${profile.userId}`, JSON.stringify(profile));
}

export function updateClientPhone(userId: string, phone: string): ClientProfile {
  const profile = loadClientProfile(userId);
  profile.phone = phone;
  saveClientProfile(profile);
  return profile;
}

export function updateClientHomeAddress(userId: string, address: LocationPoint | null): ClientProfile {
  const profile = loadClientProfile(userId);
  profile.homeAddress = address;
  saveClientProfile(profile);
  return profile;
}

export function findClientIdByPhone(phone: string): string | undefined {
  const normalized = normalizePhone(phone);
  if (!normalized) return undefined;

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(PROFILE_KEY_PREFIX)) continue;

    try {
      const profile = JSON.parse(localStorage.getItem(key) ?? '') as ClientProfile;
      if (normalizePhone(profile.phone) === normalized) {
        return profile.userId;
      }
    } catch {
      // ignore invalid entries
    }
  }

  for (const [userId, demoPhone] of Object.entries(DEFAULT_DEMO_PHONES)) {
    if (normalizePhone(demoPhone) === normalized) {
      return userId;
    }
  }

  return undefined;
}

export function phonesMatch(phoneA?: string, phoneB?: string): boolean {
  if (!phoneA || !phoneB) return false;
  return normalizePhone(phoneA) === normalizePhone(phoneB);
}
