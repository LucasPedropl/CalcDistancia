export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';

export interface PaymentRecord {
  id: string;
  orderId: string;
  invoiceId: string | null;
  externalCode: string;
  amountCents: number;
  pixEmv: string | null;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
}

export interface BixsPaymentCustomer {
  name: string;
  email: string;
  phone: string;
  document: string;
  documentType: 'CPF' | 'CNPJ';
  address: {
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
}

export interface CreatePixInvoiceInput {
  amountReais: number;
  serviceName: string;
  serviceDesc: string;
  externalCode: string;
  customer: BixsPaymentCustomer;
  city: string;
  ip?: string;
  latitude?: number;
  longitude?: number;
}

export interface PixInvoiceResult {
  invoiceId: string;
  pixEmv: string;
  status: string;
  bankSlipUrl?: string | null;
}
