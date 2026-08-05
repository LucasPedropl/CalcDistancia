import type { LocationPoint } from '../types';
import type { DeliveryOrder } from '../types/order';
import { normalizeBrazilianStateToUf } from '../types/addressForm';
import type { MotoboyProfile } from '../services/motoboyProfileService';

function normalizeCityName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function extractStateFromAddress(address: string): string {
  const withoutCep = address.replace(/\s*\(CEP[^)]*\)\s*$/i, '').trim();
  const parts = withoutCep.split(',').map((part) => part.trim()).filter(Boolean);
  const lastPart = parts[parts.length - 1] ?? '';
  return normalizeBrazilianStateToUf(lastPart);
}

function extractCityFromAddress(address: string): string {
  const withoutCep = address.replace(/\s*\(CEP[^)]*\)\s*$/i, '').trim();
  const parts = withoutCep.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return '';

  const lastPart = parts[parts.length - 1] ?? '';
  if (/^[A-Z]{2}$/i.test(lastPart)) {
    return parts[parts.length - 2] ?? '';
  }

  return '';
}

export function getLocationCityState(location: LocationPoint): { city: string; state: string } {
  return {
    city: normalizeCityName(location.city ?? extractCityFromAddress(location.address)),
    state: normalizeBrazilianStateToUf(location.state ?? extractStateFromAddress(location.address)),
  };
}

export function isSameCityState(
  location: LocationPoint,
  profile: Pick<MotoboyProfile, 'cidade' | 'estado'>,
): boolean {
  const order = getLocationCityState(location);
  const profileCity = normalizeCityName(profile.cidade);
  const profileState = normalizeBrazilianStateToUf(profile.estado);

  if (!order.city || !profileCity || !order.state || !profileState) {
    return false;
  }

  return order.city === profileCity && order.state === profileState;
}

export function isOrderReachableForMotoboy(
  order: DeliveryOrder,
  motoboyId: string,
  profile: MotoboyProfile | null,
  distanceToOriginKm: number,
  maxRadiusKm: number,
): boolean {
  if (order.assignmentMode === 'DIRECT' && order.targetMotoboyId === motoboyId) {
    return true;
  }

  if (profile && isSameCityState(order.origin, profile)) {
    return true;
  }

  if (!Number.isFinite(distanceToOriginKm)) {
    return false;
  }

  return distanceToOriginKm <= maxRadiusKm;
}
