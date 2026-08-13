import { createLocalCollectionStore } from './localCollectionStore';

export type BixPayScope = 'GLOBAL' | 'ESTABLISHMENT' | 'MOTOBOY';
export type BixPayEnvironment = 'SANDBOX' | 'PRODUCTION';

export interface BixPayCredentials {
  scope: BixPayScope;
  ownerId: string;
  merchantId: string;
  accessToken: string;
  accessPassword: string;
  pixKey?: string;
  environment: BixPayEnvironment;
  connectedAt?: string;
}

/**
 * ATENÇÃO — mock de demonstração. As credenciais ficam em localStorage, em
 * texto claro, acessíveis a qualquer script da página. Em produção isso precisa
 * viver no backend, com o token trocado por sessão no servidor.
 */
const credentialsStore = createLocalCollectionStore<BixPayCredentials>(
  'calc_distancia_bixpay_credentials',
);

function matchesOwner(credentials: BixPayCredentials, scope: BixPayScope, ownerId: string) {
  return credentials.scope === scope && credentials.ownerId === ownerId;
}

export function loadBixPayCredentials(
  scope: BixPayScope,
  ownerId: string,
): BixPayCredentials | null {
  return (
    credentialsStore.readAll().find((entry) => matchesOwner(entry, scope, ownerId)) ?? null
  );
}

export function saveBixPayCredentials(credentials: BixPayCredentials): BixPayCredentials {
  const stored: BixPayCredentials = {
    ...credentials,
    merchantId: credentials.merchantId.trim(),
    accessToken: credentials.accessToken.trim(),
    accessPassword: credentials.accessPassword.trim(),
    pixKey: credentials.pixKey?.trim() || undefined,
    connectedAt: credentials.connectedAt ?? new Date().toISOString(),
  };

  const remaining = credentialsStore
    .readAll()
    .filter((entry) => !matchesOwner(entry, stored.scope, stored.ownerId));

  credentialsStore.writeAll([...remaining, stored]);
  return stored;
}

export function removeBixPayCredentials(scope: BixPayScope, ownerId: string): void {
  credentialsStore.writeAll(
    credentialsStore.readAll().filter((entry) => !matchesOwner(entry, scope, ownerId)),
  );
}

export function isBixPayConfigured(scope: BixPayScope, ownerId: string): boolean {
  const credentials = loadBixPayCredentials(scope, ownerId);
  return Boolean(credentials?.merchantId && credentials.accessToken);
}

export interface BixPayConnectionTestResult {
  isConnected: boolean;
  message: string;
}

/** Simula o handshake com a Bix Pay — nenhuma chamada de rede é feita. */
export function testBixPayConnection(
  credentials: BixPayCredentials,
): Promise<BixPayConnectionTestResult> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (!credentials.merchantId.trim() || !credentials.accessToken.trim()) {
        reject(new Error('Informe o ID do estabelecimento e o token de acesso.'));
        return;
      }

      if (credentials.accessToken.trim().length < 8) {
        reject(new Error('Token recusado pela Bix Pay (mínimo de 8 caracteres).'));
        return;
      }

      resolve({
        isConnected: true,
        message:
          credentials.environment === 'SANDBOX'
            ? 'Conectado ao ambiente de testes da Bix Pay (simulação).'
            : 'Conectado ao ambiente de produção da Bix Pay (simulação).',
      });
    }, 700);
  });
}

export interface BixPayChargeResult {
  chargeId: string;
  status: 'APPROVED';
  paidAt: string;
}

/** Simula a cobrança com saldo Bix Pay usada nas telas de pagamento. */
export function createBixPayCharge(
  scope: BixPayScope,
  ownerId: string,
  amountCents: number,
): Promise<BixPayChargeResult> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (!isBixPayConfigured(scope, ownerId)) {
        reject(new Error('Configure as credenciais Bix Pay antes de cobrar.'));
        return;
      }
      if (amountCents <= 0) {
        reject(new Error('Valor inválido para cobrança.'));
        return;
      }

      resolve({
        chargeId: `BIX-${Date.now().toString(36).toUpperCase()}`,
        status: 'APPROVED',
        paidAt: new Date().toISOString(),
      });
    }, 900);
  });
}

export function subscribeToBixPayCredentials(listener: () => void): () => void {
  return credentialsStore.subscribe(listener);
}
