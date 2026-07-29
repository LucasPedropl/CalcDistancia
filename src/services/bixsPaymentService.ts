import { BIXS_API_ROUTES } from '../constants/bixsApi';
import { loginBixs } from './bixsWhatsappService';
import type { CreatePixInvoiceInput, PixInvoiceResult } from '../types/payment';

interface BixsInvoiceResponse {
  id?: string;
  cora_invoice_id?: string;
  pix_emv?: string;
  status?: string;
  bank_slip_url?: string;
}

async function parseApiError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string; message?: string };
    return body.error ?? body.message ?? fallback;
  } catch {
    return `${fallback} (HTTP ${response.status})`;
  }
}

function formatDueDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildInvoicePayload(input: CreatePixInvoiceInput) {
  const amountCents = Math.round(input.amountReais * 100);

  return {
    amount: amountCents,
    payment_type: 'PIX',
    due_date: formatDueDate(),
    external_code: input.externalCode,
    service_name: input.serviceName,
    service_desc: input.serviceDesc,
    customer_payment: {
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone.replace(/\D/g, ''),
      document: input.customer.document.replace(/\D/g, ''),
      document_type: input.customer.documentType,
      address: {
        street: input.customer.address.street,
        number: input.customer.address.number,
        district: input.customer.address.district,
        city: input.customer.address.city,
        state: input.customer.address.state,
        zip_code: input.customer.address.zipCode,
        country: input.customer.address.country ?? 'BR',
      },
    },
    location: {
      city: input.city,
      ip: input.ip ?? '127.0.0.1',
      latitude: input.latitude ?? 0,
      longitude: input.longitude ?? 0,
    },
  };
}

/** Cria invoice PIX na API Bixs (mesmo endpoint do PagWeb). */
export async function createPixInvoice(input: CreatePixInvoiceInput): Promise<PixInvoiceResult> {
  const token = await loginBixs();
  const payload = buildInvoicePayload(input);

  const response = await fetch(BIXS_API_ROUTES.paymentInvoices, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Falha ao gerar cobrança PIX na API Bixs'));
  }

  const data = (await response.json()) as BixsInvoiceResponse;
  const pixEmv = data.pix_emv?.trim();

  if (!pixEmv) {
    throw new Error('API Bixs não retornou código PIX (pix_emv).');
  }

  const invoiceId = data.cora_invoice_id ?? data.id ?? input.externalCode;

  return {
    invoiceId,
    pixEmv,
    status: data.status ?? 'PENDING',
    bankSlipUrl: data.bank_slip_url ?? null,
  };
}

/** Consulta status da invoice (quando API disponível). */
export async function getInvoiceStatus(invoiceId: string): Promise<string> {
  const token = await loginBixs();
  const response = await fetch(`${BIXS_API_ROUTES.paymentInvoices}/${invoiceId}`, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Falha ao consultar status do pagamento'));
  }

  const data = (await response.json()) as { status?: string };
  return data.status ?? 'UNKNOWN';
}
