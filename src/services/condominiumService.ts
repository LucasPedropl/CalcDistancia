import type { LocationPoint } from '../types';
import type { CondominiumPartnerStatus } from '../types/condominium';
import { calculateHaversineDistanceKm } from '../utils/distance';
import { addressesLikelySameArea } from '../utils/condominiumAddressMatch';

const CONDO_PROFILE_KEY_PREFIX = 'calc_distancia_condo_profile_';
const CONDOS_UPDATED_EVENT = 'calc-distancia-condominiums-updated';

export interface CondominiumProfile {
  userId: string;
  name: string;
  address: LocationPoint;
  registeredAt: string;
  partnerStatus: CondominiumPartnerStatus;
  cnpj?: string;
  unitsCount?: number;
  presidentName?: string;
  presidentPhone?: string;
  presidentEmail?: string;
  planId?: string;
  submittedForReviewAt?: string;
  reviewedAt?: string;
  reviewedByAdminId?: string;
  rejectionReason?: string;
}

const CONDOMINIUM_NAME_PATTERN = /condom[ií]nio|residencial|edif[ií]cio|torre|village|park|garden|plaza/i;

export function isCondominiumNameValid(name: string): boolean {
  return CONDOMINIUM_NAME_PATTERN.test(name.trim());
}

/**
 * Perfis criados antes da parceria não têm `partnerStatus`. Promovê-los a
 * APPROVED evita que sumam do fluxo de pedido quando o filtro de parceiros
 * entra em vigor.
 */
function normalizeLegacyProfile(profile: CondominiumProfile): CondominiumProfile {
  if (profile.partnerStatus) return profile;
  return { ...profile, partnerStatus: 'APPROVED' };
}

export function loadCondominiumProfile(userId: string): CondominiumProfile | null {
  try {
    const raw = localStorage.getItem(`${CONDO_PROFILE_KEY_PREFIX}${userId}`);
    if (!raw) return null;
    return normalizeLegacyProfile(JSON.parse(raw) as CondominiumProfile);
  } catch {
    return null;
  }
}

export function saveCondominiumProfile(profile: CondominiumProfile): void {
  localStorage.setItem(`${CONDO_PROFILE_KEY_PREFIX}${profile.userId}`, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent(CONDOS_UPDATED_EVENT));
}

export function deleteCondominiumProfile(userId: string): void {
  localStorage.removeItem(`${CONDO_PROFILE_KEY_PREFIX}${userId}`);
  window.dispatchEvent(new CustomEvent(CONDOS_UPDATED_EVENT));
}

export function updateCondominiumLocation(
  userId: string,
  address: LocationPoint,
): CondominiumProfile {
  const existing = loadCondominiumProfile(userId);
  if (!existing) {
    throw new Error('Condomínio não cadastrado.');
  }

  const updated: CondominiumProfile = { ...existing, address };
  saveCondominiumProfile(updated);
  return updated;
}

export function registerCondominium(
  userId: string,
  name: string,
  address: LocationPoint,
): CondominiumProfile {
  if (!isCondominiumNameValid(name)) {
    throw new Error(
      'O nome deve indicar que é um condomínio (ex.: Residencial, Condomínio, Edifício).',
    );
  }

  const profile: CondominiumProfile = {
    userId,
    name: name.trim(),
    address,
    registeredAt: new Date().toISOString(),
    partnerStatus: 'DRAFT',
  };

  saveCondominiumProfile(profile);
  return profile;
}

export interface CondominiumNearDestination {
  profile: CondominiumProfile;
  distanceKm: number;
}

export interface CondominiumProximityOptions {
  /** Retaguarda usa `true` para enxergar também os não parceiros. */
  includeNonPartner?: boolean;
}

export function isPartnerCondominium(profile: CondominiumProfile): boolean {
  return profile.partnerStatus === 'APPROVED';
}

export function listCondominiumsNearDestination(
  destination: LocationPoint,
  maxRadiusKm = 0.5,
  options: CondominiumProximityOptions = {},
): CondominiumNearDestination[] {
  const results: CondominiumNearDestination[] = [];

  for (const profile of loadAllCondominiumProfiles()) {
    if (!options.includeNonPartner && !isPartnerCondominium(profile)) continue;

    const distanceKm = calculateHaversineDistanceKm(
      destination.lat,
      destination.lng,
      profile.address.lat,
      profile.address.lng,
    );

    if (distanceKm <= maxRadiusKm || addressesLikelySameArea(destination, profile.address)) {
      results.push({ profile, distanceKm });
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

export function findCondominiumAtDestination(
  destination: LocationPoint,
  maxRadiusKm = 0.5,
  options: CondominiumProximityOptions = {},
): CondominiumProfile | null {
  return listCondominiumsNearDestination(destination, maxRadiusKm, options)[0]?.profile ?? null;
}

export function loadAllCondominiumProfiles(): CondominiumProfile[] {
  const profiles: CondominiumProfile[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(CONDO_PROFILE_KEY_PREFIX)) continue;

    try {
      profiles.push(normalizeLegacyProfile(JSON.parse(localStorage.getItem(key) ?? '') as CondominiumProfile));
    } catch {
      // ignore invalid entries
    }
  }

  return profiles;
}

export function isDestinationNearCondominium(
  destination: LocationPoint,
  profile: CondominiumProfile,
  maxRadiusKm = 0.5,
): boolean {
  return (
    calculateHaversineDistanceKm(
      destination.lat,
      destination.lng,
      profile.address.lat,
      profile.address.lng,
    ) <= maxRadiusKm
  );
}

export function subscribeToCondominiums(listener: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key?.startsWith(CONDO_PROFILE_KEY_PREFIX)) listener();
  };
  const handleCustom = () => listener();

  window.addEventListener('storage', handleStorage);
  window.addEventListener(CONDOS_UPDATED_EVENT, handleCustom);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(CONDOS_UPDATED_EVENT, handleCustom);
  };
}
