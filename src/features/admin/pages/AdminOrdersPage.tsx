import { usePlatformOrderHistory } from '../../../hooks/useOrderHistory';
import { OrderHistoryPanel } from '../../../components/history/OrderHistoryPanel';
import { AdminPageContainer } from '../components/AdminPageContainer';

export function AdminOrdersPage() {
  const orders = usePlatformOrderHistory();

  return (
    <AdminPageContainer
      title="Histórico de corridas"
      description="Todas as corridas da plataforma, de qualquer estabelecimento ou motoboy."
    >
      <OrderHistoryPanel
        orders={orders}
        variant="PLATFORM"
        amountLabel="Volume entregue"
        emptyMessage="Nenhuma corrida criada ainda. Use o botão de dados de demonstração na visão geral."
      />
    </AdminPageContainer>
  );
}
