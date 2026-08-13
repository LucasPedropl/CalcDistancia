import type { CondominiumPlan } from '../types/condominium';
import { createLocalCollectionStore, generateEntityId } from './localCollectionStore';

const planStore = createLocalCollectionStore<CondominiumPlan>('calc_distancia_condo_plans');

const SEED_PLANS: CondominiumPlan[] = [
  {
    id: 'PLAN-BASICO',
    name: 'Básico',
    description: 'Portaria recebe as entregas e acompanha o motoboy em rota.',
    monthlyPriceCents: 0,
    includedDeliveries: 50,
    features: ['Painel de entregas ativas', 'Autorização manual de moradores'],
    isActive: true,
  },
  {
    id: 'PLAN-SEGURANCA',
    name: 'Segurança',
    description: 'Auditoria completa de visitas e validação documental dos motoboys.',
    monthlyPriceCents: 14900,
    includedDeliveries: 300,
    features: [
      'Histórico de auditoria de visitas',
      'Lista de motoboys em rota',
      'Autorização de moradores em lote',
    ],
    isActive: true,
  },
  {
    id: 'PLAN-PREMIUM',
    name: 'Premium',
    description: 'Entregas ilimitadas com relatórios e suporte prioritário.',
    monthlyPriceCents: 29900,
    includedDeliveries: null,
    features: ['Entregas ilimitadas', 'Relatórios mensais', 'Suporte prioritário'],
    isActive: true,
  },
];

function ensureSeedPlans(): CondominiumPlan[] {
  const plans = planStore.readAll();
  if (plans.length > 0) return plans;

  planStore.writeAll(SEED_PLANS);
  return SEED_PLANS;
}

export function listCondominiumPlans(): CondominiumPlan[] {
  return ensureSeedPlans();
}

export function listActiveCondominiumPlans(): CondominiumPlan[] {
  return listCondominiumPlans().filter((plan) => plan.isActive);
}

export function getCondominiumPlanById(planId: string | undefined): CondominiumPlan | undefined {
  if (!planId) return undefined;
  return listCondominiumPlans().find((plan) => plan.id === planId);
}

export type CondominiumPlanDraft = Omit<CondominiumPlan, 'id'>;

export function createCondominiumPlan(draft: CondominiumPlanDraft): CondominiumPlan {
  const plan: CondominiumPlan = { ...draft, id: generateEntityId('PLAN') };
  planStore.writeAll([...listCondominiumPlans(), plan]);
  return plan;
}

export function updateCondominiumPlan(
  planId: string,
  draft: CondominiumPlanDraft,
): CondominiumPlan | null {
  const plans = listCondominiumPlans();
  const planIndex = plans.findIndex((plan) => plan.id === planId);
  if (planIndex === -1) return null;

  const updated: CondominiumPlan = { ...draft, id: planId };
  plans[planIndex] = updated;
  planStore.writeAll(plans);
  return updated;
}

export function deleteCondominiumPlan(planId: string): void {
  planStore.writeAll(listCondominiumPlans().filter((plan) => plan.id !== planId));
}

export function formatPlanPrice(monthlyPriceCents: number): string {
  if (monthlyPriceCents === 0) return 'Gratuito';

  return (monthlyPriceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function subscribeToCondominiumPlans(listener: () => void): () => void {
  return planStore.subscribe(listener);
}
