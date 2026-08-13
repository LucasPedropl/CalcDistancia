import { useCallback, useEffect, useState } from 'react';
import type {
  CondominiumDocument,
  CondominiumPlan,
  CondominiumVisit,
  ResidentLink,
} from '../types/condominium';
import {
  loadAllCondominiumProfiles,
  loadCondominiumProfile,
  subscribeToCondominiums,
  type CondominiumProfile,
} from '../services/condominiumService';
import {
  listCondominiumDocuments,
  subscribeToCondominiumDocuments,
} from '../services/condominiumDocumentService';
import {
  listCondominiumResidents,
  subscribeToCondominiumResidents,
} from '../services/condominiumResidentService';
import {
  listCondominiumVisits,
  subscribeToCondominiumVisits,
} from '../services/condominiumVisitService';
import {
  listCondominiumPlans,
  subscribeToCondominiumPlans,
} from '../services/condominiumPlanService';

function useSubscribedValue<TValue>(
  read: () => TValue,
  subscribe: (listener: () => void) => () => void,
): TValue {
  const [value, setValue] = useState<TValue>(read);

  const refresh = useCallback(() => {
    setValue(read());
  }, [read]);

  useEffect(() => {
    refresh();
    return subscribe(refresh);
  }, [refresh, subscribe]);

  return value;
}

export function useCondominiumProfile(userId: string | undefined): CondominiumProfile | null {
  const read = useCallback(
    () => (userId ? loadCondominiumProfile(userId) : null),
    [userId],
  );

  return useSubscribedValue(read, subscribeToCondominiums);
}

export function useAllCondominiums(): CondominiumProfile[] {
  const read = useCallback(() => loadAllCondominiumProfiles(), []);
  return useSubscribedValue(read, subscribeToCondominiums);
}

export function useCondominiumDocuments(condominiumId: string | undefined): CondominiumDocument[] {
  const read = useCallback(
    () => (condominiumId ? listCondominiumDocuments(condominiumId) : []),
    [condominiumId],
  );

  return useSubscribedValue(read, subscribeToCondominiumDocuments);
}

export function useCondominiumResidents(condominiumId: string | undefined): ResidentLink[] {
  const read = useCallback(
    () => (condominiumId ? listCondominiumResidents(condominiumId) : []),
    [condominiumId],
  );

  return useSubscribedValue(read, subscribeToCondominiumResidents);
}

export function useCondominiumVisits(condominiumId: string | undefined): CondominiumVisit[] {
  const read = useCallback(
    () => (condominiumId ? listCondominiumVisits(condominiumId) : []),
    [condominiumId],
  );

  return useSubscribedValue(read, subscribeToCondominiumVisits);
}

export function useCondominiumPlans(): CondominiumPlan[] {
  const read = useCallback(() => listCondominiumPlans(), []);
  return useSubscribedValue(read, subscribeToCondominiumPlans);
}
