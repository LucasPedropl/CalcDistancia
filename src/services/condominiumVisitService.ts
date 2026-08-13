import type { CondominiumVisit, CondominiumVisitAuthorizationMethod } from '../types/condominium';
import { createLocalCollectionStore, generateEntityId } from './localCollectionStore';

const visitStore = createLocalCollectionStore<CondominiumVisit>('calc_distancia_condo_visits');

export function listCondominiumVisits(condominiumId: string): CondominiumVisit[] {
  return visitStore
    .readAll()
    .filter((visit) => visit.condominiumId === condominiumId)
    .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime());
}

export function findVisitByOrder(orderId: string): CondominiumVisit | undefined {
  return visitStore.readAll().find((visit) => visit.orderId === orderId);
}

export interface RegisterCondominiumVisitInput {
  condominiumId: string;
  orderId: string;
  motoboyId?: string;
  motoboyName: string;
  residentName: string;
  unitLabel?: string;
  destinationAddress: string;
  authorizationMethod: CondominiumVisitAuthorizationMethod;
}

/** Registra a entrada do motoboy. Idempotente por pedido. */
export function registerCondominiumVisit(
  input: RegisterCondominiumVisitInput,
): CondominiumVisit {
  const existing = findVisitByOrder(input.orderId);
  if (existing) return existing;

  const visit: CondominiumVisit = {
    id: generateEntityId('VIS'),
    condominiumId: input.condominiumId,
    orderId: input.orderId,
    motoboyId: input.motoboyId,
    motoboyName: input.motoboyName,
    residentName: input.residentName,
    unitLabel: input.unitLabel,
    destinationAddress: input.destinationAddress,
    authorizationMethod: input.authorizationMethod,
    enteredAt: new Date().toISOString(),
  };

  visitStore.writeAll([...visitStore.readAll(), visit]);
  return visit;
}

export function registerVisitExit(visitId: string): CondominiumVisit | null {
  const visits = visitStore.readAll();
  const visitIndex = visits.findIndex((visit) => visit.id === visitId);
  if (visitIndex === -1) return null;

  const updated: CondominiumVisit = {
    ...visits[visitIndex],
    exitedAt: new Date().toISOString(),
  };

  visits[visitIndex] = updated;
  visitStore.writeAll(visits);
  return updated;
}

export function registerVisitExitByOrder(orderId: string): CondominiumVisit | null {
  const visit = findVisitByOrder(orderId);
  if (!visit || visit.exitedAt) return null;
  return registerVisitExit(visit.id);
}

export function subscribeToCondominiumVisits(listener: () => void): () => void {
  return visitStore.subscribe(listener);
}
