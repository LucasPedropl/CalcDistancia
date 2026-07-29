/**
 * API de pagamentos PIX via Bixs (mesmo gateway do PagWeb).
 * Fallback local quando a API estiver indisponível.
 */
import { createPixInvoice } from './bixsPaymentService';
import type { BixsPaymentCustomer } from '../types/payment';

export interface PixPayload {
  valor: number;
  descricao: string;
  telefoneCliente: string;
  nomeCliente: string;
  emailCliente?: string;
  orderId: string;
  origem: string;
  destino: string;
  customer?: Partial<BixsPaymentCustomer>;
}

export interface PixResponse {
  pixCopiaECola: string;
  invoiceId: string;
  externalCode: string;
  txid: string;
  isSimulated: boolean;
}

function buildDefaultCustomer(payload: PixPayload): BixsPaymentCustomer {
  return {
    name: payload.nomeCliente,
    email: payload.emailCliente ?? 'cliente@calc-distancia.local',
    phone: payload.telefoneCliente,
    document: payload.customer?.document ?? '00000000000',
    documentType: 'CPF',
    address: payload.customer?.address ?? {
      street: 'Rua Exemplo',
      number: '100',
      district: 'Centro',
      city: 'Belo Horizonte',
      state: 'MG',
      zipCode: '30130000',
      country: 'BR',
    },
  };
}

function buildSimulatedPix(payload: PixPayload): PixResponse {
  const externalCode = `calc-${payload.orderId}-${Date.now()}`;
  return {
    pixCopiaECola:
      '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865405' +
      String(Math.round(payload.valor * 100)).padStart(4, '0') +
      '5802BR5925UaiPDV CalcDistancia6009BELO HORIZONTE62070503***6304DEMO',
    invoiceId: `sim-${externalCode}`,
    externalCode,
    txid: externalCode,
    isSimulated: true,
  };
}

export const paymentApi = {
  async gerarPix(payload: PixPayload): Promise<PixResponse> {
    const externalCode = `calc-${payload.orderId}-${Date.now()}`;

    try {
      const result = await createPixInvoice({
        amountReais: payload.valor,
        serviceName: `Entrega ${payload.orderId}`,
        serviceDesc: payload.descricao,
        externalCode,
        customer: buildDefaultCustomer(payload),
        city: payload.customer?.address?.city ?? 'Belo Horizonte',
      });

      return {
        pixCopiaECola: result.pixEmv,
        invoiceId: result.invoiceId,
        externalCode,
        txid: result.invoiceId,
        isSimulated: false,
      };
    } catch (error) {
      console.warn('[paymentApi] API Bixs indisponível, usando PIX simulado:', error);
      return buildSimulatedPix(payload);
    }
  },
};
