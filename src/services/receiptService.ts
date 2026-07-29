import type { DeliveryOrder } from '../types/order';

/** Gera comprovante em PDF simples (blob URL) para envio via WhatsApp. */
export function generateOrderReceiptBlob(order: DeliveryOrder, paidAt: string): string {
  const lines = [
    'COMPROVANTE DE PAGAMENTO - UaiPDV CalcDistancia',
    '================================================',
    `Pedido: ${order.id}`,
    `Cliente: ${order.clientName}`,
    `Motoboy: ${order.acceptedMotoboyName ?? 'A definir'}`,
    `Valor: R$ ${(order.price ?? 0).toFixed(2)}`,
    `Distância: ${order.distanceKm} km`,
    `Origem: ${order.origin.address}`,
    `Destino: ${order.destination.address}`,
    `Pago em: ${new Date(paidAt).toLocaleString('pt-BR')}`,
    '================================================',
    'Pagamento processado via PIX (API Bixs).',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}
