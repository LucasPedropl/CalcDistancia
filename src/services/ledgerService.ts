import type { DeliveryOrder } from '../types/order';
import { createLocalCollectionStore, generateEntityId } from './localCollectionStore';
import { calculateSplit } from './splitConfigService';

export type LedgerOwnerType = 'ESTABLISHMENT' | 'MOTOBOY' | 'CONDOMINIUM' | 'PLATFORM';
export type LedgerDirection = 'CREDIT' | 'DEBIT';
export type LedgerCategory =
  | 'DELIVERY_FEE'
  | 'PLATFORM_FEE'
  | 'PAYOUT'
  | 'TOPUP'
  | 'PLAN_CHARGE';

export interface LedgerEntry {
  id: string;
  ownerType: LedgerOwnerType;
  ownerId: string;
  orderId?: string;
  direction: LedgerDirection;
  category: LedgerCategory;
  amountCents: number;
  description: string;
  method?: string;
  createdAt: string;
}

const ledgerStore = createLocalCollectionStore<LedgerEntry>('calc_distancia_ledger_entries');

export function listLedgerEntries(ownerType: LedgerOwnerType, ownerId: string): LedgerEntry[] {
  return ledgerStore
    .readAll()
    .filter((entry) => entry.ownerType === ownerType && entry.ownerId === ownerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getLedgerBalanceCents(ownerType: LedgerOwnerType, ownerId: string): number {
  return listLedgerEntries(ownerType, ownerId).reduce(
    (balance, entry) =>
      entry.direction === 'CREDIT' ? balance + entry.amountCents : balance - entry.amountCents,
    0,
  );
}

export type LedgerEntryDraft = Omit<LedgerEntry, 'id' | 'createdAt'>;

export function recordLedgerEntry(draft: LedgerEntryDraft): LedgerEntry {
  const entry: LedgerEntry = {
    ...draft,
    id: generateEntityId('LAN'),
    createdAt: new Date().toISOString(),
  };

  ledgerStore.writeAll([...ledgerStore.readAll(), entry]);
  return entry;
}

function hasEntryForOrder(orderId: string, category: LedgerCategory): boolean {
  return ledgerStore
    .readAll()
    .some((entry) => entry.orderId === orderId && entry.category === category);
}

/**
 * Lança na caderneta o rateio de um pedido pago. Idempotente por pedido para
 * suportar reprocessamento das telas de pagamento.
 */
export function recordOrderPaymentEntries(order: DeliveryOrder): void {
  if (!order.price || order.price <= 0) return;
  if (hasEntryForOrder(order.id, 'DELIVERY_FEE')) return;

  const totalCents = Math.round(order.price * 100);
  const split = calculateSplit(totalCents);
  const method = order.paymentMethod ?? 'PIX';

  if (order.acceptedMotoboyId) {
    recordLedgerEntry({
      ownerType: 'MOTOBOY',
      ownerId: order.acceptedMotoboyId,
      orderId: order.id,
      direction: 'CREDIT',
      category: 'DELIVERY_FEE',
      amountCents: split.motoboyCents,
      description: `Corrida ${order.trackingCode ?? order.id}`,
      method,
    });
  }

  recordLedgerEntry({
    ownerType: 'PLATFORM',
    ownerId: 'platform',
    orderId: order.id,
    direction: 'CREDIT',
    category: 'PLATFORM_FEE',
    amountCents: split.platformCents,
    description: `Taxa da corrida ${order.trackingCode ?? order.id}`,
    method,
  });

  if (order.paymentResponsibility === 'ESTABLISHMENT') {
    recordLedgerEntry({
      ownerType: 'ESTABLISHMENT',
      ownerId: order.clientId,
      orderId: order.id,
      direction: 'DEBIT',
      category: 'DELIVERY_FEE',
      amountCents: totalCents,
      description: `Entrega ${order.trackingCode ?? order.id}`,
      method,
    });
  }
}

export function formatLedgerAmount(amountCents: number): string {
  return (amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function subscribeToLedger(listener: () => void): () => void {
  return ledgerStore.subscribe(listener);
}
