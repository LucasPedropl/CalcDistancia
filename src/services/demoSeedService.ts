import type { CondominiumPartnerStatus } from '../types/condominium';
import { loadCondominiumProfile, saveCondominiumProfile } from './condominiumService';
import { buildStableUserId } from './sessionService';
import { listCondominiumPlans } from './condominiumPlanService';
import {
  createResidentLink,
  findResidentByPhone,
  requestResidentLinkFromOrder,
} from './condominiumResidentService';
import { registerCondominiumVisit } from './condominiumVisitService';
import { generateEntityId } from './localCollectionStore';

interface DemoCondominiumSeed {
  email: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  partnerStatus: CondominiumPartnerStatus;
  planIndex?: number;
  cnpj: string;
  unitsCount: number;
  presidentName: string;
  presidentPhone: string;
  rejectionReason?: string;
}

const DEMO_CONDOMINIUMS: DemoCondominiumSeed[] = [
  {
    email: 'goldengarden@condominio.com',
    name: 'Residencial Golden Garden',
    address: 'Av. Amocim Leite, 320 - Aviação, São Mateus/ES',
    lat: -18.7189,
    lng: -39.8562,
    partnerStatus: 'APPROVED',
    planIndex: 1,
    cnpj: '12.345.678/0001-90',
    unitsCount: 96,
    presidentName: 'Helena Martins',
    presidentPhone: '(27) 99811-2233',
  },
  {
    email: 'portaldomar@condominio.com',
    name: 'Condomínio Portal do Mar',
    address: 'Rua das Gaivotas, 150 - Guriri, São Mateus/ES',
    lat: -18.7402,
    lng: -39.8121,
    partnerStatus: 'PENDING_REVIEW',
    cnpj: '98.765.432/0001-10',
    unitsCount: 48,
    presidentName: 'Carlos Bianchi',
    presidentPhone: '(27) 99744-8890',
  },
  {
    email: 'edificioaurora@condominio.com',
    name: 'Edifício Aurora',
    address: 'Rua Monsenhor Guilherme, 88 - Centro, São Mateus/ES',
    lat: -18.7151,
    lng: -39.8603,
    partnerStatus: 'REJECTED',
    cnpj: '11.222.333/0001-44',
    unitsCount: 24,
    presidentName: 'Rita Andrade',
    presidentPhone: '(27) 99622-1177',
    rejectionReason: 'A ata enviada está ilegível e não comprova a eleição do síndico atual.',
  },
];

const DEMO_RESIDENTS = [
  { name: 'Maria Souza', phone: '(27) 99901-1122', unitLabel: 'Bloco A - 201' },
  { name: 'João Ferreira', phone: '(27) 99902-3344', unitLabel: 'Bloco B - 402' },
];

const DEMO_PENDING_RESIDENT = { name: 'Paulo Ribeiro', phone: '(27) 99903-5566' };

export interface DemoSeedResult {
  condominiumsCreated: number;
  residentsCreated: number;
  visitsCreated: number;
}

/**
 * Popula condomínios, moradores e visitas para demonstrar os fluxos de
 * aprovação em uma única máquina (a persistência é local por navegador).
 */
export function seedDemoData(): DemoSeedResult {
  const plans = listCondominiumPlans();
  let condominiumsCreated = 0;
  let residentsCreated = 0;
  let visitsCreated = 0;

  for (const seed of DEMO_CONDOMINIUMS) {
    const userId = buildStableUserId('CONDOMINIO', seed.email);

    if (!loadCondominiumProfile(userId)) {
      saveCondominiumProfile({
        userId,
        name: seed.name,
        address: {
          address: seed.address,
          lat: seed.lat,
          lng: seed.lng,
          city: 'São Mateus',
          state: 'ES',
        },
        registeredAt: new Date().toISOString(),
        partnerStatus: seed.partnerStatus,
        planId: seed.planIndex !== undefined ? plans[seed.planIndex]?.id : undefined,
        cnpj: seed.cnpj,
        unitsCount: seed.unitsCount,
        presidentName: seed.presidentName,
        presidentPhone: seed.presidentPhone,
        presidentEmail: seed.email,
        submittedForReviewAt:
          seed.partnerStatus === 'PENDING_REVIEW' ? new Date().toISOString() : undefined,
        rejectionReason: seed.rejectionReason,
      });
      condominiumsCreated += 1;
    }

    if (seed.partnerStatus !== 'APPROVED') continue;

    for (const resident of DEMO_RESIDENTS) {
      if (findResidentByPhone(userId, resident.phone)) continue;
      createResidentLink({ condominiumId: userId, ...resident });
      residentsCreated += 1;
    }

    if (!findResidentByPhone(userId, DEMO_PENDING_RESIDENT.phone)) {
      requestResidentLinkFromOrder({ condominiumId: userId, ...DEMO_PENDING_RESIDENT });
      residentsCreated += 1;
    }

    const visit = registerCondominiumVisit({
      condominiumId: userId,
      orderId: generateEntityId('DEMO-PED'),
      motoboyName: 'João Pedro',
      residentName: DEMO_RESIDENTS[0].name,
      unitLabel: DEMO_RESIDENTS[0].unitLabel,
      destinationAddress: seed.address,
      authorizationMethod: 'PARTNER_AUTH',
    });
    if (visit) visitsCreated += 1;
  }

  return { condominiumsCreated, residentsCreated, visitsCreated };
}
