import type { PriceTier } from '../types';

export type PriceTableOwner = 'SYSTEM' | 'MOTOBOY';

export interface PriceTable {
  id: string;
  name: string;
  ownerType: PriceTableOwner;
  ownerId: string | null;
  tiers: PriceTier[];
  isActive: boolean;
  createdAt: string;
}

const TABLES_KEY = 'calc_distancia_price_tables';
const TABLES_EVENT = 'calc-distancia-price-tables-updated';

function loadTables(): PriceTable[] {
  try {
    const raw = localStorage.getItem(TABLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PriceTable[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTables(tables: PriceTable[]): void {
  localStorage.setItem(TABLES_KEY, JSON.stringify(tables));
  window.dispatchEvent(new CustomEvent(TABLES_EVENT));
}

function createDefaultSystemTable(tiers: PriceTier[]): PriceTable {
  return {
    id: 'system-default',
    name: 'Tabela Padrão',
    ownerType: 'SYSTEM',
    ownerId: null,
    tiers,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

export function ensurePriceTablesInitialized(defaultTiers: PriceTier[]): void {
  const existing = loadTables();
  if (existing.length === 0) {
    saveTables([createDefaultSystemTable(defaultTiers)]);
  }
}

export function listPriceTables(ownerType?: PriceTableOwner, ownerId?: string | null): PriceTable[] {
  return loadTables().filter((table) => {
    if (ownerType && table.ownerType !== ownerType) return false;
    if (ownerId !== undefined && table.ownerId !== ownerId) return false;
    return true;
  });
}

export function getActivePriceTable(
  ownerType: PriceTableOwner,
  ownerId: string | null,
  fallbackTiers: PriceTier[],
): PriceTable {
  const tables = listPriceTables(ownerType, ownerId);
  const active = tables.find((t) => t.isActive);
  if (active) return active;

  if (tables.length > 0) {
    const first = { ...tables[0], isActive: true };
    activatePriceTable(first.id);
    return first;
  }

  const created = createDefaultSystemTable(fallbackTiers);
  if (ownerType === 'MOTOBOY' && ownerId) {
    created.ownerType = 'MOTOBOY';
    created.ownerId = ownerId;
    created.name = 'Minha Tabela';
  }
  saveTables([...loadTables(), created]);
  return created;
}

export function activatePriceTable(tableId: string): PriceTable | null {
  const tables = loadTables();
  const target = tables.find((t) => t.id === tableId);
  if (!target) return null;

  const updated = tables.map((table) => {
    const sameScope =
      table.ownerType === target.ownerType && table.ownerId === target.ownerId;
    if (!sameScope) return table;
    return { ...table, isActive: table.id === tableId };
  });

  saveTables(updated);
  return updated.find((t) => t.id === tableId) ?? null;
}

export function upsertPriceTable(table: Omit<PriceTable, 'createdAt'> & { createdAt?: string }): PriceTable {
  const tables = loadTables();
  const index = tables.findIndex((t) => t.id === table.id);
  const record: PriceTable = {
    ...table,
    createdAt: table.createdAt ?? new Date().toISOString(),
  };

  if (index === -1) {
    saveTables([...tables, record]);
  } else {
    tables[index] = record;
    saveTables(tables);
  }

  if (record.isActive) {
    activatePriceTable(record.id);
  }

  return record;
}

export function createPriceTable(input: {
  name: string;
  ownerType: PriceTableOwner;
  ownerId: string | null;
  tiers: PriceTier[];
  activate?: boolean;
}): PriceTable {
  const table: PriceTable = {
    id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name,
    ownerType: input.ownerType,
    ownerId: input.ownerId,
    tiers: input.tiers,
    isActive: Boolean(input.activate),
    createdAt: new Date().toISOString(),
  };

  upsertPriceTable(table);
  if (input.activate) activatePriceTable(table.id);
  return table;
}

export function subscribeToPriceTables(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(TABLES_EVENT, handler);
  return () => window.removeEventListener(TABLES_EVENT, handler);
}
