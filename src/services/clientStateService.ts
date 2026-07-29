import type { LocationPoint } from '../types';

const LAST_ORIGIN_KEY = 'calc_distancia_last_origin';
const FAVORITE_MOTOBOYS_KEY = 'calc_distancia_favorite_motoboys';

export function saveLastOrigin(userId: string, origin: LocationPoint): void {
  localStorage.setItem(`${LAST_ORIGIN_KEY}_${userId}`, JSON.stringify(origin));
}

export function loadLastOrigin(userId: string): LocationPoint | null {
  try {
    const raw = localStorage.getItem(`${LAST_ORIGIN_KEY}_${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as LocationPoint;
  } catch {
    return null;
  }
}

export function loadFavoriteMotoboyIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${FAVORITE_MOTOBOYS_KEY}_${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function saveFavoriteMotoboyIds(userId: string, motoboyIds: string[]): void {
  localStorage.setItem(`${FAVORITE_MOTOBOYS_KEY}_${userId}`, JSON.stringify(motoboyIds));
}

export function toggleFavoriteMotoboy(userId: string, motoboyId: string): string[] {
  const current = loadFavoriteMotoboyIds(userId);
  const next = current.includes(motoboyId)
    ? current.filter((id) => id !== motoboyId)
    : [...current, motoboyId];
  saveFavoriteMotoboyIds(userId, next);
  return next;
}
