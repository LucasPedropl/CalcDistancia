import type { AvailableMotoboy } from '../types/order';
import type { LocationPoint } from '../types';
import { calculateHaversineDistanceKm } from '../utils/distance';
import { loadMotoboyProfile } from './motoboyProfileService';

export const DEFAULT_MOTOBOY_SEARCH_RADIUS_KM = 15;

export const DEFAULT_REFERENCE_LOCATION: LocationPoint = {
  lat: -18.7163,
  lng: -39.8589,
  address: 'Centro, São Mateus, ES',
};

const STATUS_KEY = 'calc_distancia_motoboy_status';
const STATUS_EVENT = 'calc-distancia-motoboy-status-updated';

const DEFAULT_MOTOBOYS: AvailableMotoboy[] = [
  { id: 'mb-001', name: 'João Pedro', lat: -18.7163, lng: -39.8589, status: 'ONLINE', vehicle: 'Moto' },
  { id: 'mb-002', name: 'Marcos Silva', lat: -18.7420, lng: -39.8230, status: 'ONLINE', vehicle: 'Moto' },
  { id: 'mb-003', name: 'Ana Costa', lat: -18.7280, lng: -39.8720, status: 'ONLINE', vehicle: 'Carro' },
  { id: 'mb-004', name: 'Ricardo Lima', lat: -18.7080, lng: -39.8520, status: 'ONLINE', vehicle: 'Moto' },
  { id: 'mb-005', name: 'Felipe Souza', lat: -18.7250, lng: -39.8480, status: 'ONLINE', vehicle: 'Moto' },
  { id: 'mb-006', name: 'Carla Mendes', lat: -18.7320, lng: -39.8650, status: 'BUSY', vehicle: 'Moto' },
];

export const DEMO_MOTOBOY_IDS = DEFAULT_MOTOBOYS.map((motoboy) => motoboy.id);

function loadStatusOverrides(): Record<string, AvailableMotoboy['status']> {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, AvailableMotoboy['status']>;
  } catch {
    return {};
  }
}

function saveStatusOverrides(overrides: Record<string, AvailableMotoboy['status']>): void {
  localStorage.setItem(STATUS_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new CustomEvent(STATUS_EVENT));
}

function resolveMotoboyStatus(motoboyId: string, defaultStatus: AvailableMotoboy['status']): AvailableMotoboy['status'] {
  return loadStatusOverrides()[motoboyId] ?? defaultStatus;
}

function withResolvedStatus(motoboy: AvailableMotoboy): AvailableMotoboy {
  return { ...motoboy, status: resolveMotoboyStatus(motoboy.id, motoboy.status) };
}

export interface MotoboyWithDistance extends AvailableMotoboy {
  distanceKm: number;
}

export function updateMotoboyStatus(motoboyId: string, status: AvailableMotoboy['status']): void {
  const overrides = loadStatusOverrides();
  overrides[motoboyId] = status;
  saveStatusOverrides(overrides);
}

export function getAvailableMotoboys(): AvailableMotoboy[] {
  return DEFAULT_MOTOBOYS.map(withResolvedStatus).filter((motoboy) => {
    if (motoboy.status !== 'ONLINE') return false;
    const profile = loadMotoboyProfile(motoboy.id);
    if (profile && !profile.publico) return false;
    return true;
  });
}

export function getMotoboyById(motoboyId: string): AvailableMotoboy | undefined {
  const found = DEFAULT_MOTOBOYS.find((motoboy) => motoboy.id === motoboyId);
  return found ? withResolvedStatus(found) : undefined;
}

export function searchMotoboys(query: string): AvailableMotoboy[] {
  const term = query.toLowerCase().trim();
  if (!term) return getAvailableMotoboys();

  return DEFAULT_MOTOBOYS.map(withResolvedStatus).filter((motoboy) => {
    const profile = loadMotoboyProfile(motoboy.id);
    if (profile && !profile.publico) return false;

    const nameMatch = motoboy.name.toLowerCase().includes(term);
    const plateMatch = profile?.placa?.toLowerCase().includes(term);
    const phoneMatch = profile?.telefone?.replace(/\D/g, '').includes(term.replace(/\D/g, ''));
    return nameMatch || plateMatch || phoneMatch;
  });
}

export function getMotoboysNearLocation(
  location: LocationPoint = DEFAULT_REFERENCE_LOCATION,
  options?: { searchTerm?: string; radiusKm?: number },
): MotoboyWithDistance[] {
  const radiusKm = options?.radiusKm ?? DEFAULT_MOTOBOY_SEARCH_RADIUS_KM;
  const base = options?.searchTerm ? searchMotoboys(options.searchTerm) : getAvailableMotoboys();

  return base
    .map((motoboy) => ({
      ...motoboy,
      distanceKm: calculateHaversineDistanceKm(
        location.lat,
        location.lng,
        motoboy.lat,
        motoboy.lng,
      ),
    }))
    .filter((motoboy) => motoboy.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function getMotoboyPositionsNearOrigin(origin: LocationPoint): AvailableMotoboy[] {
  return getMotoboysNearLocation(origin).map(({ distanceKm: _distanceKm, ...motoboy }) => motoboy);
}

export function subscribeToMotoboyStatus(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(STATUS_EVENT, handler);
  window.addEventListener('storage', (e) => {
    if (e.key === STATUS_KEY) callback();
  });
  return () => window.removeEventListener(STATUS_EVENT, handler);
}

