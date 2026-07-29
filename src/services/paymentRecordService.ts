import type { PaymentRecord, PaymentStatus } from '../types/payment';

const PAYMENTS_KEY = 'calc_distancia_payments';
const PAYMENTS_EVENT = 'calc-distancia-payments-updated';

function loadPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PaymentRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePayments(records: PaymentRecord[]): void {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(PAYMENTS_EVENT));
}

export function createPaymentRecord(input: {
  orderId: string;
  invoiceId: string | null;
  externalCode: string;
  amountCents: number;
  pixEmv: string | null;
}): PaymentRecord {
  const record: PaymentRecord = {
    id: `pay-${Date.now()}`,
    orderId: input.orderId,
    invoiceId: input.invoiceId,
    externalCode: input.externalCode,
    amountCents: input.amountCents,
    pixEmv: input.pixEmv,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  const records = loadPayments();
  records.unshift(record);
  savePayments(records);
  return record;
}

export function getPaymentByOrderId(orderId: string): PaymentRecord | null {
  return loadPayments().find((p) => p.orderId === orderId && p.status === 'PENDING') ?? null;
}

export function markPaymentPaid(orderId: string, invoiceId?: string): PaymentRecord | null {
  const records = loadPayments();
  const index = records.findIndex(
    (p) => p.orderId === orderId && (invoiceId ? p.invoiceId === invoiceId : p.status === 'PENDING'),
  );
  if (index === -1) return null;

  records[index] = {
    ...records[index],
    status: 'PAID' as PaymentStatus,
    paidAt: new Date().toISOString(),
  };
  savePayments(records);
  return records[index];
}

export function subscribeToPayments(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(PAYMENTS_EVENT, handler);
  window.addEventListener('storage', (e) => {
    if (e.key === PAYMENTS_KEY) callback();
  });
  return () => window.removeEventListener(PAYMENTS_EVENT, handler);
}
