import type { PriceTier } from '../types';

export const DEFAULT_PRICE_TIERS: PriceTier[] = [
  { id: '1', minKm: 0, maxKm: 5, price: 10, label: '0 - 5 km' },
  { id: '2', minKm: 6, maxKm: 10, price: 15, label: '6 - 10 km' },
  { id: '3', minKm: 11, maxKm: 20, price: 25, label: '11 - 20 km' },
  { id: '4', minKm: 21, maxKm: 50, price: 50, label: '21 - 50 km' },
  { id: '5', minKm: 51, maxKm: null, price: null, label: '> 50 km (Sob Consulta)' },
];

const STORAGE_TIERS_KEY = 'calc_distancia_price_tiers';

export function loadSavedPriceTiers(): PriceTier[] {
  try {
    const raw = localStorage.getItem(STORAGE_TIERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load saved price tiers', e);
  }
  return DEFAULT_PRICE_TIERS;
}

export function savePriceTiers(tiers: PriceTier[]): void {
  try {
    localStorage.setItem(STORAGE_TIERS_KEY, JSON.stringify(tiers));
  } catch (e) {
    console.error('Failed to save price tiers', e);
  }
}

/**
 * Finds matching price tier based on total distance in km.
 */
export function getTierForDistance(distanceKm: number, tiers: PriceTier[] = loadSavedPriceTiers()): PriceTier | undefined {
  const roundedKm = Math.round(distanceKm);
  return tiers.find((tier) => {
    if (tier.maxKm === null) {
      return roundedKm >= tier.minKm;
    }
    return roundedKm >= tier.minKm && roundedKm <= tier.maxKm;
  });
}

export function getPriceForDistance(
  distanceKm: number,
  tiers: PriceTier[] = loadSavedPriceTiers()
): number | null {
  const tier = getTierForDistance(distanceKm, tiers);
  return tier?.price ?? null;
}

export function formatCurrency(amount: number | null): string {
  if (amount === null) return 'Sob Consulta';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}
