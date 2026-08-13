import type { CondominiumProfile } from '../../../services/condominiumService';
import { useCondominiumOrderHistory } from '../../../hooks/useOrderHistory';
import { OrderHistoryPanel } from '../../../components/history/OrderHistoryPanel';
import { CondominioPageContainer } from '../components/CondominioPageContainer';

interface CondominioHistoryPageProps {
  profile: CondominiumProfile;
}

export function CondominioHistoryPage({ profile }: CondominioHistoryPageProps) {
  const orders = useCondominiumOrderHistory(profile.userId, profile.address);

  return (
    <CondominioPageContainer
      title="Histórico de corridas"
      description="Todas as entregas com destino ao condomínio, incluindo as já concluídas e as canceladas."
    >
      <OrderHistoryPanel
        orders={orders}
        variant="CONDOMINIUM"
        amountLabel="Valor entregue"
        emptyMessage="Nenhuma entrega registrada para este endereço ainda."
      />
    </CondominioPageContainer>
  );
}
