import type { LocationPoint } from '../types';
import { calculateHaversineDistanceKm } from '../utils/distance';
import {
  extractStreetLine,
  normalizeAddressToken,
  normalizeCepDigits,
} from '../utils/addressNormalization';

const CONDO_PROFILE_KEY_PREFIX = 'calc_distancia_condo_profile_';

export interface CondominiumProfile {
  userId: string;
  name: string;
  address: LocationPoint;
  registeredAt: string;
}

const CONDOMINIUM_NAME_PATTERN = /condom[ií]nio|residencial|edif[ií]cio|torre|village|park|garden|plaza/i;

export function isCondominiumNameValid(name: string): boolean {
  return CONDOMINIUM_NAME_PATTERN.test(name.trim());
}

export function loadCondominiumProfile(userId: string): CondominiumProfile | null {
  try {
    const raw = localStorage.getItem(`${CONDO_PROFILE_KEY_PREFIX}${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as CondominiumProfile;
  } catch {
    return null;
  }
}

export function saveCondominiumProfile(profile: CondominiumProfile): void {
  localStorage.setItem(`${CONDO_PROFILE_KEY_PREFIX}${profile.userId}`, JSON.stringify(profile));
}

export function updateCondominiumLocation(
  userId: string,
  address: LocationPoint,
): CondominiumProfile {
  const existing = loadCondominiumProfile(userId);
  if (!existing) {
    throw new Error('Condomínio não cadastrado.');
  }

  const updated: CondominiumProfile = {
    ...existing,
    address,
  };

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
  };

  saveCondominiumProfile(profile);
  return profile;
}

export function findCondominiumAtDestination(
  destination: LocationPoint,
  maxRadiusKm = 0.5,
): CondominiumProfile | null {
  const nearby = listCondominiumsNearDestination(destination, maxRadiusKm);
  return nearby[0]?.profile ?? null;
}

export interface CondominiumNearDestination {
  profile: CondominiumProfile;
  distanceKm: number;
}

function streetsLikelyMatch(destination: LocationPoint, condoAddress: LocationPoint): boolean {
  const destStreet = normalizeAddressToken(extractStreetLine(destination.address));
  const condoStreet = normalizeAddressToken(extractStreetLine(condoAddress.address));

  if (destStreet.length < 5 || condoStreet.length < 5) return false;

  return destStreet.includes(condoStreet) || condoStreet.includes(destStreet);
}

function addressesLikelySameArea(destination: LocationPoint, condoAddress: LocationPoint): boolean {
  const destCep = normalizeCepDigits(destination.cep);
  const condoCep = normalizeCepDigits(condoAddress.cep);

  if (destCep.length === 8 && condoCep.length === 8 && destCep === condoCep) {
    if (streetsLikelyMatch(destination, condoAddress)) return true;

    const destDistrict = normalizeAddressToken(destination.district ?? '');
    const condoDistrict = normalizeAddressToken(condoAddress.district ?? '');
    if (destDistrict && condoDistrict && destDistrict === condoDistrict) return true;
  }

  return streetsLikelyMatch(destination, condoAddress);
}

export function listCondominiumsNearDestination(
  destination: LocationPoint,
  maxRadiusKm = 0.5,
): CondominiumNearDestination[] {
  const results: CondominiumNearDestination[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(CONDO_PROFILE_KEY_PREFIX)) continue;

    try {
      const profile = JSON.parse(localStorage.getItem(key) ?? '') as CondominiumProfile;
      const distanceKm = calculateHaversineDistanceKm(
        destination.lat,
        destination.lng,
        profile.address.lat,
        profile.address.lng,
      );

      const addressMatch = addressesLikelySameArea(destination, profile.address);

      if (distanceKm <= maxRadiusKm || addressMatch) {
        results.push({ profile, distanceKm });
      }
    } catch {
      // ignore invalid entries
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

export function loadAllCondominiumProfiles(): CondominiumProfile[] {
  const profiles: CondominiumProfile[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(CONDO_PROFILE_KEY_PREFIX)) continue;

    try {
      profiles.push(JSON.parse(localStorage.getItem(key) ?? '') as CondominiumProfile);
    } catch {
      // ignore
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
