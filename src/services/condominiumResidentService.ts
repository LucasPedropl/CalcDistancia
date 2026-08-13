import type { ResidentLink, ResidentLinkStatus } from '../types/condominium';
import { createLocalCollectionStore, generateEntityId } from './localCollectionStore';
import { phonesMatch } from './clientProfileService';

const residentStore = createLocalCollectionStore<ResidentLink>('calc_distancia_condo_residents');

export function listCondominiumResidents(condominiumId: string): ResidentLink[] {
  return residentStore
    .readAll()
    .filter((resident) => resident.condominiumId === condominiumId)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
}

export function listResidentsByStatus(
  condominiumId: string,
  status: ResidentLinkStatus,
): ResidentLink[] {
  return listCondominiumResidents(condominiumId).filter((resident) => resident.status === status);
}

export function findResidentByPhone(
  condominiumId: string,
  phone: string | undefined,
): ResidentLink | undefined {
  if (!phone) return undefined;

  return listCondominiumResidents(condominiumId).find((resident) =>
    phonesMatch(resident.phone, phone),
  );
}

export function isResidentAuthorized(condominiumId: string, phone: string | undefined): boolean {
  return findResidentByPhone(condominiumId, phone)?.status === 'APPROVED';
}

export interface CreateResidentLinkInput {
  condominiumId: string;
  name: string;
  phone: string;
  unitLabel: string;
  documentNumber?: string;
}

/** Cadastro feito pela portaria: entra já autorizado. */
export function createResidentLink(input: CreateResidentLinkInput): ResidentLink {
  const existing = findResidentByPhone(input.condominiumId, input.phone);
  if (existing) {
    return updateResidentStatus(existing.id, 'APPROVED') ?? existing;
  }

  const resident: ResidentLink = {
    id: generateEntityId('MOR'),
    condominiumId: input.condominiumId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    unitLabel: input.unitLabel.trim(),
    documentNumber: input.documentNumber?.trim() || undefined,
    status: 'APPROVED',
    origin: 'MANUAL',
    requestedAt: new Date().toISOString(),
    decidedAt: new Date().toISOString(),
  };

  residentStore.writeAll([...residentStore.readAll(), resident]);
  return resident;
}

export interface RequestResidentLinkInput {
  condominiumId: string;
  name: string;
  phone: string;
  unitLabel?: string;
}

/**
 * Solicitação disparada por um pedido com destino no condomínio. Não duplica
 * quando já existe vínculo (aprovado, pendente ou recusado) para o telefone.
 */
export function requestResidentLinkFromOrder(
  input: RequestResidentLinkInput,
): ResidentLink | null {
  if (!input.phone.trim()) return null;

  const existing = findResidentByPhone(input.condominiumId, input.phone);
  if (existing) return existing;

  const resident: ResidentLink = {
    id: generateEntityId('MOR'),
    condominiumId: input.condominiumId,
    name: input.name.trim() || 'Morador não identificado',
    phone: input.phone.trim(),
    unitLabel: input.unitLabel?.trim() || 'Não informado',
    status: 'PENDING',
    origin: 'ORDER',
    requestedAt: new Date().toISOString(),
  };

  residentStore.writeAll([...residentStore.readAll(), resident]);
  return resident;
}

export function updateResidentStatus(
  residentId: string,
  status: ResidentLinkStatus,
  decisionNote?: string,
): ResidentLink | null {
  const residents = residentStore.readAll();
  const residentIndex = residents.findIndex((resident) => resident.id === residentId);
  if (residentIndex === -1) return null;

  const updated: ResidentLink = {
    ...residents[residentIndex],
    status,
    decidedAt: new Date().toISOString(),
    decisionNote: decisionNote?.trim() ? decisionNote.trim() : undefined,
  };

  residents[residentIndex] = updated;
  residentStore.writeAll(residents);
  return updated;
}

export function updateResidentDetails(
  residentId: string,
  details: Pick<CreateResidentLinkInput, 'name' | 'phone' | 'unitLabel' | 'documentNumber'>,
): ResidentLink | null {
  const residents = residentStore.readAll();
  const residentIndex = residents.findIndex((resident) => resident.id === residentId);
  if (residentIndex === -1) return null;

  const updated: ResidentLink = {
    ...residents[residentIndex],
    name: details.name.trim(),
    phone: details.phone.trim(),
    unitLabel: details.unitLabel.trim(),
    documentNumber: details.documentNumber?.trim() || undefined,
  };

  residents[residentIndex] = updated;
  residentStore.writeAll(residents);
  return updated;
}

export function removeResidentLink(residentId: string): void {
  residentStore.writeAll(residentStore.readAll().filter((resident) => resident.id !== residentId));
}

export function countPendingResidents(condominiumId: string): number {
  return listResidentsByStatus(condominiumId, 'PENDING').length;
}

export function subscribeToCondominiumResidents(listener: () => void): () => void {
  return residentStore.subscribe(listener);
}
