import type { PriceTier } from '../types';
import {
  ensurePriceTablesInitialized,
  getActivePriceTable,
  listPriceTables,
  upsertPriceTable,
  activatePriceTable,
} from './priceTableService';

export const DEFAULT_PRICE_TIERS: PriceTier[] = [
  { id: '1', minKm: 0, maxKm: 5, price: 10, label: '0 - 5 km' },
  { id: '2', minKm: 6, maxKm: 10, price: 15, label: '6 - 10 km' },
  { id: '3', minKm: 11, maxKm: 20, price: 25, label: '11 - 20 km' },
  { id: '4', minKm: 21, maxKm: 50, price: 50, label: '21 - 50 km' },
  {
    id: '5',
    minKm: 51,
    maxKm: null,
    price: 50,
    pricePerKm: 2,
    label: 'Acima de 50 km',
  },
];

const STORAGE_TIERS_KEY = 'calc_distancia_price_tiers';

export function buildTierLabel(minKm: number, maxKm: number | null): string {
  if (maxKm === null) return `Acima de ${minKm} km`;
  if (minKm === maxKm) return `${minKm} km`;
  return `${minKm} - ${maxKm} km`;
}

export function createEmptyPriceTier(minKm = 0): PriceTier {
  const id = `tier-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    minKm,
    maxKm: minKm + 5,
    price: 10,
    pricePerKm: null,
    label: buildTierLabel(minKm, minKm + 5),
  };
}

export function loadSavedPriceTiers(): PriceTier[] {
  migrateLegacySystemTiers();
  ensurePriceTablesInitialized(DEFAULT_PRICE_TIERS.map((tier) => ({ ...tier })));
  const table = getActivePriceTable('SYSTEM', null, DEFAULT_PRICE_TIERS.map((tier) => ({ ...tier })));
  return table.tiers;
}

function migrateLegacySystemTiers(): void {
  try {
    const raw = localStorage.getItem(STORAGE_TIERS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as PriceTier[];
    if (!Array.isArray(parsed) || parsed.length === 0) return;
    const existing = listPriceTables('SYSTEM', null);
    if (existing.length > 0) return;
    upsertPriceTable({
      id: 'system-default',
      name: 'Tabela Padrão',
      ownerType: 'SYSTEM',
      ownerId: null,
      tiers: parsed,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    localStorage.removeItem(STORAGE_TIERS_KEY);
  } catch {
    // ignore
  }
}

export function savePriceTiers(tiers: PriceTier[]): void {
  migrateLegacySystemTiers();
  ensurePriceTablesInitialized(DEFAULT_PRICE_TIERS.map((tier) => ({ ...tier })));
  const tables = listPriceTables('SYSTEM', null);
  const active = tables.find((t) => t.isActive) ?? tables[0];
  if (active) {
    upsertPriceTable({ ...active, tiers, isActive: true });
    activatePriceTable(active.id);
  }
}

/**
 * Finds matching price tier based on total distance in km.
 */
export function getTierForDistance(
  distanceKm: number,
  tiers: PriceTier[] = loadSavedPriceTiers(),
): PriceTier | undefined {
  const roundedKm = Math.max(0, Math.round(distanceKm));
  const sorted = [...tiers].sort((a, b) => a.minKm - b.minKm);

  return sorted.find((tier) => {
    if (tier.maxKm === null) {
      return roundedKm >= tier.minKm;
    }
    return roundedKm >= tier.minKm && roundedKm <= tier.maxKm;
  });
}

export function getPriceForDistance(
  distanceKm: number,
  tiers: PriceTier[] = loadSavedPriceTiers(),
): number | null {
  const tier = getTierForDistance(distanceKm, tiers);
  if (!tier) return null;

  const roundedKm = Math.max(0, Math.round(distanceKm));

  if (tier.pricePerKm !== null && tier.pricePerKm !== undefined && tier.maxKm === null) {
    const extraKm = Math.max(0, roundedKm - tier.minKm);
    const base = tier.price ?? 0;
    return Math.round((base + extraKm * tier.pricePerKm) * 100) / 100;
  }

  return tier.price ?? null;
}

export function formatCurrency(amount: number | null): string {
  if (amount === null) return 'Sob Consulta';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

export function formatTierPriceSummary(tier: PriceTier): string {
  if (tier.pricePerKm !== null && tier.pricePerKm !== undefined && tier.maxKm === null) {
    const base = tier.price !== null ? `R$ ${tier.price.toFixed(2)} + ` : '';
    return `${base}R$ ${tier.pricePerKm.toFixed(2)}/km acima de ${tier.minKm} km`;
  }
  if (tier.price === null) return 'Sob consulta';
  return formatCurrency(tier.price);
}
