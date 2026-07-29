import type { AvailableMotoboy } from '../types/order';
import type { LocationPoint } from '../types';
import { calculateHaversineDistanceKm } from '../utils/distance';
import { loadMotoboyProfile } from './motoboyProfileService';

export const DEFAULT_REFERENCE_LOCATION: LocationPoint = {
  lat: -19.9173,
  lng: -43.9345,
  address: 'Belo Horizonte, MG',
};

const STATUS_KEY = 'calc_distancia_motoboy_status';
const STATUS_EVENT = 'calc-distancia-motoboy-status-updated';

const DEFAULT_MOTOBOYS: AvailableMotoboy[] = [
  { id: 'mb-001', name: 'João Pedro', lat: -19.9223, lng: -43.9305, status: 'ONLINE', vehicle: 'Moto' },
  { id: 'mb-002', name: 'Marcos Silva', lat: -19.9143, lng: -43.9385, status: 'ONLINE', vehicle: 'Moto' },
  { id: 'mb-003', name: 'Ana Costa', lat: -19.9283, lng: -43.9265, status: 'ONLINE', vehicle: 'Carro' },
  { id: 'mb-004', name: 'Ricardo Lima', lat: -19.9093, lng: -43.9425, status: 'ONLINE', vehicle: 'Moto' },
  { id: 'mb-005', name: 'Felipe Souza', lat: -19.9183, lng: -43.9455, status: 'ONLINE', vehicle: 'Moto' },
  { id: 'mb-006', name: 'Carla Mendes', lat: -19.9253, lng: -43.9185, status: 'ONLINE', vehicle: 'Moto' },
];

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
  searchTerm?: string,
): MotoboyWithDistance[] {
  const base = searchTerm ? searchMotoboys(searchTerm) : getAvailableMotoboys();

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
