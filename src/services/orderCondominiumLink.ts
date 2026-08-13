import type { LocationPoint } from '../types';
import type { DeliveryOrder } from '../types/order';
import type { ResidentAuthorizationStatus } from '../types/condominium';
import {
  findCondominiumAtDestination,
  isPartnerCondominium,
  loadCondominiumProfile,
} from './condominiumService';
import { findResidentByPhone, requestResidentLinkFromOrder } from './condominiumResidentService';
import { registerCondominiumVisit } from './condominiumVisitService';

export interface ResolveOrderCondominiumInput {
  destination: LocationPoint;
  /** null = o usuário marcou explicitamente que não é condomínio */
  condominiumId?: string | null;
  condominiumName?: string;
  recipientName?: string;
  recipientPhone?: string;
}

export interface OrderCondominiumLink {
  condominiumId?: string;
  condominiumName?: string;
  condominiumUnitLabel?: string;
  residentAuthorizationStatus?: ResidentAuthorizationStatus;
}

/**
 * Resolve o condomínio do destino e o estado de autorização do morador. Quando
 * o morador ainda não é autorizado, registra a solicitação para a portaria
 * decidir e o motoboy segue com identificação convencional.
 */
export function resolveOrderCondominiumLink(
  input: ResolveOrderCondominiumInput,
): OrderCondominiumLink {
  if (input.condominiumId === null) return {};

  const profile = input.condominiumId
    ? loadCondominiumProfile(input.condominiumId)
    : findCondominiumAtDestination(input.destination);

  if (!profile) return {};

  if (!isPartnerCondominium(profile)) {
    return {
      condominiumId: profile.userId,
      condominiumName: input.condominiumName ?? profile.name,
      residentAuthorizationStatus: 'CONVENTIONAL',
    };
  }

  const resident = findResidentByPhone(profile.userId, input.recipientPhone);

  if (resident?.status === 'APPROVED') {
    return {
      condominiumId: profile.userId,
      condominiumName: input.condominiumName ?? profile.name,
      condominiumUnitLabel: resident.unitLabel,
      residentAuthorizationStatus: 'AUTHORIZED',
    };
  }

  const requested = requestResidentLinkFromOrder({
    condominiumId: profile.userId,
    name: input.recipientName ?? 'Morador não identificado',
    phone: input.recipientPhone ?? '',
    address: input.destination.address,
  });

  return {
    condominiumId: profile.userId,
    condominiumName: input.condominiumName ?? profile.name,
    condominiumUnitLabel: requested?.unitLabel,
    residentAuthorizationStatus: requested?.status === 'APPROVED' ? 'AUTHORIZED' : 'PENDING',
  };
}

/** Registra a visita na auditoria do condomínio ao concluir a entrega. */
export function registerOrderCondominiumVisit(order: DeliveryOrder): void {
  if (!order.condominiumId) return;

  registerCondominiumVisit({
    condominiumId: order.condominiumId,
    orderId: order.id,
    motoboyId: order.acceptedMotoboyId ?? order.pickedUpMotoboyId,
    motoboyName: order.acceptedMotoboyName ?? order.pickedUpMotoboyName ?? 'Motoboy',
    residentName: order.recipientClientName ?? 'Morador',
    unitLabel: order.condominiumUnitLabel,
    destinationAddress: order.destination.address,
    authorizationMethod:
      order.residentAuthorizationStatus === 'AUTHORIZED' ? 'PARTNER_AUTH' : 'CONVENTIONAL',
  });
}
