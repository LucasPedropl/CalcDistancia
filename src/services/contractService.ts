import type { UserRole } from '../context/AuthContext';
import { createLocalCollectionStore, generateEntityId } from './localCollectionStore';

export interface ContractTemplate {
  id: string;
  role: UserRole;
  version: number;
  title: string;
  content: string;
  publishedAt: string;
  isActive: boolean;
}

export interface ContractAcceptance {
  id: string;
  templateId: string;
  userId: string;
  role: UserRole;
  version: number;
  acceptedAt: string;
}

const templateStore = createLocalCollectionStore<ContractTemplate>(
  'calc_distancia_contract_templates',
);
const acceptanceStore = createLocalCollectionStore<ContractAcceptance>(
  'calc_distancia_contract_acceptances',
);

const SEED_TEMPLATES: Omit<ContractTemplate, 'id' | 'publishedAt' | 'isActive'>[] = [
  {
    role: 'ESTABELECIMENTO',
    version: 1,
    title: 'Termos de uso do estabelecimento',
    content:
      'O estabelecimento é responsável pelos dados informados no pedido e pelo pagamento das entregas contratadas conforme a modalidade escolhida no checkout. Cancelamentos após o aceite do motoboy podem gerar cobrança de deslocamento. A plataforma intermedeia a corrida e não responde pelo conteúdo transportado.',
  },
  {
    role: 'MOTOBOY',
    version: 1,
    title: 'Termos de prestação de serviço do motoboy',
    content:
      'O motoboy atua como prestador autônomo, responsável por documentação, habilitação e seguro do veículo. Ao aceitar uma corrida, compromete-se a cumprir a coleta e a entrega no prazo informado e a se identificar na portaria quando o morador não estiver autorizado. Os repasses seguem o rateio vigente na plataforma.',
  },
  {
    role: 'CONDOMINIO',
    version: 1,
    title: 'Termos de parceria do condomínio',
    content:
      'O condomínio declara que os documentos enviados são verdadeiros e que o signatário representa legalmente o empreendimento. A autorização de moradores e a liberação de entrada dos motoboys são de responsabilidade da administração do condomínio. O plano contratado pode ser alterado mediante aviso prévio.',
  },
];

function ensureSeedTemplates(): ContractTemplate[] {
  const templates = templateStore.readAll();
  if (templates.length > 0) return templates;

  const seeded = SEED_TEMPLATES.map((template) => ({
    ...template,
    id: generateEntityId('CTR'),
    publishedAt: new Date().toISOString(),
    isActive: true,
  }));

  templateStore.writeAll(seeded);
  return seeded;
}

export function listContractTemplates(): ContractTemplate[] {
  return ensureSeedTemplates().sort((a, b) => a.role.localeCompare(b.role));
}

export function getActiveContractForRole(role: UserRole): ContractTemplate | null {
  return (
    listContractTemplates()
      .filter((template) => template.role === role && template.isActive)
      .sort((a, b) => b.version - a.version)[0] ?? null
  );
}

/** Salvar um contrato publica uma nova versão e desativa a anterior do papel. */
export function publishContractVersion(
  role: UserRole,
  title: string,
  content: string,
): ContractTemplate {
  const templates = listContractTemplates();
  const currentVersion = templates
    .filter((template) => template.role === role)
    .reduce((highest, template) => Math.max(highest, template.version), 0);

  const published: ContractTemplate = {
    id: generateEntityId('CTR'),
    role,
    version: currentVersion + 1,
    title: title.trim(),
    content: content.trim(),
    publishedAt: new Date().toISOString(),
    isActive: true,
  };

  const deactivated = templates.map((template) =>
    template.role === role ? { ...template, isActive: false } : template,
  );

  templateStore.writeAll([...deactivated, published]);
  return published;
}

export function hasAcceptedActiveContract(userId: string, role: UserRole): boolean {
  const active = getActiveContractForRole(role);
  if (!active) return true;

  return acceptanceStore
    .readAll()
    .some((acceptance) => acceptance.userId === userId && acceptance.templateId === active.id);
}

export function acceptContract(userId: string, template: ContractTemplate): ContractAcceptance {
  const acceptance: ContractAcceptance = {
    id: generateEntityId('ACE'),
    templateId: template.id,
    userId,
    role: template.role,
    version: template.version,
    acceptedAt: new Date().toISOString(),
  };

  acceptanceStore.writeAll([...acceptanceStore.readAll(), acceptance]);
  return acceptance;
}

export function listContractAcceptances(templateId: string): ContractAcceptance[] {
  return acceptanceStore
    .readAll()
    .filter((acceptance) => acceptance.templateId === templateId)
    .sort((a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime());
}

export function subscribeToContracts(listener: () => void): () => void {
  const unsubscribeTemplates = templateStore.subscribe(listener);
  const unsubscribeAcceptances = acceptanceStore.subscribe(listener);

  return () => {
    unsubscribeTemplates();
    unsubscribeAcceptances();
  };
}
