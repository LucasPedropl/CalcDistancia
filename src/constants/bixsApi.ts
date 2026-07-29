/** Base da API Gateway Bixs (mesmo padrão do app Bixs). */
export const BIXS_API_BASE = import.meta.env.VITE_BIXS_API_BASE ?? 'https://api.bixs.com.br';

export const BIXS_API_ROUTES = {
  authLogin: `${BIXS_API_BASE}/v1/auth/login`,
  uploadMedia: `${BIXS_API_BASE}/v1/api/upload/media`,
  instances: `${BIXS_API_BASE}/v1/api/instances`,
  messagesSend: `${BIXS_API_BASE}/v1/api/messages/send`,
  paymentInvoices: `${BIXS_API_BASE}/v1/api/payment/invoices`,
} as const;

export const BIXS_AUTH_SOURCE = 'api_externa';

export function getBixsAuthPayload() {
  const email = import.meta.env.VITE_BIXS_API_EMAIL;
  const password = import.meta.env.VITE_BIXS_API_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Credenciais Bixs não configuradas. Defina VITE_BIXS_API_EMAIL e VITE_BIXS_API_PASSWORD no .env.local',
    );
  }

  return {
    email,
    password,
    mac: 'calc-distancia',
    source: BIXS_AUTH_SOURCE,
  };
}

export const BIXS_TEST_PHONE = import.meta.env.VITE_BIXS_TEST_PHONE ?? '31972532104';
