import type { PriceTier } from '../types';
import {
  DEFAULT_PRICE_TIERS,
  getPriceForDistance as getPriceFromTiers,
  getTierForDistance as getTierFromTiers,
} from './pricingService';
import {
  ensurePriceTablesInitialized,
  getActivePriceTable,
  listPriceTables,
  upsertPriceTable,
  activatePriceTable,
  createPriceTable,
} from './priceTableService';

const MOTOBOY_LEGACY_KEY = 'calc_distancia_motoboy_price_tiers';

export function loadMotoboyPriceTiers(motoboyId: string): PriceTier[] {
  migrateLegacyMotoboyTiers(motoboyId);
  ensurePriceTablesInitialized(DEFAULT_PRICE_TIERS.map((t) => ({ ...t })));
  const table = getActivePriceTable('MOTOBOY', motoboyId, DEFAULT_PRICE_TIERS.map((t) => ({ ...t })));
  return table.tiers;
}

export function saveMotoboyPriceTiers(motoboyId: string, tiers: PriceTier[]): void {
  ensurePriceTablesInitialized(DEFAULT_PRICE_TIERS.map((t) => ({ ...t })));
  const tables = listPriceTables('MOTOBOY', motoboyId);
  const active = tables.find((t) => t.isActive) ?? tables[0];

  if (active) {
    upsertPriceTable({ ...active, tiers, isActive: true });
    activatePriceTable(active.id);
  } else {
    createPriceTable({
      name: 'Minha Tabela',
      ownerType: 'MOTOBOY',
      ownerId: motoboyId,
      tiers,
      activate: true,
    });
  }
}

function migrateLegacyMotoboyTiers(motoboyId: string): void {
  try {
    const raw = localStorage.getItem(`${MOTOBOY_LEGACY_KEY}_${motoboyId}`);
    if (!raw) return;
    const parsed = JSON.parse(raw) as PriceTier[];
    if (!Array.isArray(parsed) || parsed.length === 0) return;

    const existing = listPriceTables('MOTOBOY', motoboyId);
    if (existing.length > 0) return;

    createPriceTable({
      name: 'Minha Tabela',
      ownerType: 'MOTOBOY',
      ownerId: motoboyId,
      tiers: parsed,
      activate: true,
    });
    localStorage.removeItem(`${MOTOBOY_LEGACY_KEY}_${motoboyId}`);
  } catch {
    // ignore migration errors
  }
}

export function getMotoboyPriceForDistance(motoboyId: string, distanceKm: number): number | null {
  const motoboyTiers = loadMotoboyPriceTiers(motoboyId);
  return getPriceFromTiers(distanceKm, motoboyTiers);
}

export function getDefaultPriceForDistance(distanceKm: number): number | null {
  ensurePriceTablesInitialized(DEFAULT_PRICE_TIERS.map((t) => ({ ...t })));
  const table = getActivePriceTable('SYSTEM', null, DEFAULT_PRICE_TIERS.map((t) => ({ ...t })));
  return getPriceFromTiers(distanceKm, table.tiers);
}

export function getMotoboyTierForDistance(motoboyId: string, distanceKm: number) {
  return getTierFromTiers(distanceKm, loadMotoboyPriceTiers(motoboyId));
}
