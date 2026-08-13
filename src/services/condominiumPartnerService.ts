import type { LocationPoint } from '../types';
import type { CondominiumPartnerStatus } from '../types/condominium';
import {
  loadAllCondominiumProfiles,
  loadCondominiumProfile,
  saveCondominiumProfile,
  type CondominiumProfile,
} from './condominiumService';
import { areRequiredDocumentsComplete } from './condominiumDocumentService';
import { buildStableUserId } from './sessionService';

export interface CondominiumDetailsInput {
  name?: string;
  cnpj?: string;
  unitsCount?: number;
  presidentName?: string;
  presidentPhone?: string;
  presidentEmail?: string;
}

function requireProfile(userId: string): CondominiumProfile {
  const profile = loadCondominiumProfile(userId);
  if (!profile) {
    throw new Error('Condomínio não encontrado.');
  }
  return profile;
}

export function updateCondominiumDetails(
  userId: string,
  details: CondominiumDetailsInput,
): CondominiumProfile {
  const profile = requireProfile(userId);

  const updated: CondominiumProfile = {
    ...profile,
    name: details.name?.trim() || profile.name,
    cnpj: details.cnpj?.trim() || undefined,
    unitsCount: details.unitsCount,
    presidentName: details.presidentName?.trim() || undefined,
    presidentPhone: details.presidentPhone?.trim() || undefined,
    presidentEmail: details.presidentEmail?.trim() || undefined,
  };

  saveCondominiumProfile(updated);
  return updated;
}

/** Envia o cadastro para análise da retaguarda. Exige documentos obrigatórios. */
export function submitCondominiumForReview(userId: string): CondominiumProfile {
  const profile = requireProfile(userId);

  if (!areRequiredDocumentsComplete(userId)) {
    throw new Error('Envie todos os documentos obrigatórios antes de solicitar a análise.');
  }

  const updated: CondominiumProfile = {
    ...profile,
    partnerStatus: 'PENDING_REVIEW',
    submittedForReviewAt: new Date().toISOString(),
    rejectionReason: undefined,
  };

  saveCondominiumProfile(updated);
  return updated;
}

export function approveCondominium(
  userId: string,
  adminId: string,
  planId?: string,
): CondominiumProfile {
  const profile = requireProfile(userId);

  const updated: CondominiumProfile = {
    ...profile,
    partnerStatus: 'APPROVED',
    planId: planId ?? profile.planId,
    reviewedAt: new Date().toISOString(),
    reviewedByAdminId: adminId,
    rejectionReason: undefined,
  };

  saveCondominiumProfile(updated);
  return updated;
}

export function rejectCondominium(
  userId: string,
  adminId: string,
  reason: string,
): CondominiumProfile {
  const profile = requireProfile(userId);

  if (!reason.trim()) {
    throw new Error('Informe o motivo da rejeição.');
  }

  const updated: CondominiumProfile = {
    ...profile,
    partnerStatus: 'REJECTED',
    reviewedAt: new Date().toISOString(),
    reviewedByAdminId: adminId,
    rejectionReason: reason.trim(),
  };

  saveCondominiumProfile(updated);
  return updated;
}

export function setCondominiumPartnerStatus(
  userId: string,
  partnerStatus: CondominiumPartnerStatus,
  adminId: string,
): CondominiumProfile {
  const profile = requireProfile(userId);

  const updated: CondominiumProfile = {
    ...profile,
    partnerStatus,
    reviewedAt: new Date().toISOString(),
    reviewedByAdminId: adminId,
  };

  saveCondominiumProfile(updated);
  return updated;
}

export function assignCondominiumPlan(userId: string, planId: string | null): CondominiumProfile {
  const profile = requireProfile(userId);
  const updated: CondominiumProfile = { ...profile, planId: planId ?? undefined };
  saveCondominiumProfile(updated);
  return updated;
}

export interface CreateCondominiumFromBackofficeInput {
  email: string;
  name: string;
  address: LocationPoint;
  partnerStatus?: CondominiumPartnerStatus;
  planId?: string;
  details?: CondominiumDetailsInput;
}

export function createCondominiumFromBackoffice(
  input: CreateCondominiumFromBackofficeInput,
): CondominiumProfile {
  const normalizedEmail = input.email.toLowerCase().trim();
  if (!normalizedEmail) {
    throw new Error('Informe o e-mail de acesso do condomínio.');
  }

  const userId = buildStableUserId('CONDOMINIO', normalizedEmail);
  if (loadCondominiumProfile(userId)) {
    throw new Error('Já existe um condomínio cadastrado com este e-mail.');
  }

  const profile: CondominiumProfile = {
    userId,
    name: input.name.trim(),
    address: input.address,
    registeredAt: new Date().toISOString(),
    partnerStatus: input.partnerStatus ?? 'APPROVED',
    planId: input.planId,
    presidentEmail: normalizedEmail,
    cnpj: input.details?.cnpj?.trim() || undefined,
    unitsCount: input.details?.unitsCount,
    presidentName: input.details?.presidentName?.trim() || undefined,
    presidentPhone: input.details?.presidentPhone?.trim() || undefined,
  };

  saveCondominiumProfile(profile);
  return profile;
}

export interface CondominiumStatusCounts {
  total: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  draft: number;
  suspended: number;
}

export function getCondominiumStatusCounts(): CondominiumStatusCounts {
  const profiles = loadAllCondominiumProfiles();

  return {
    total: profiles.length,
    pendingReview: profiles.filter((profile) => profile.partnerStatus === 'PENDING_REVIEW').length,
    approved: profiles.filter((profile) => profile.partnerStatus === 'APPROVED').length,
    rejected: profiles.filter((profile) => profile.partnerStatus === 'REJECTED').length,
    draft: profiles.filter((profile) => profile.partnerStatus === 'DRAFT').length,
    suspended: profiles.filter((profile) => profile.partnerStatus === 'SUSPENDED').length,
  };
}
