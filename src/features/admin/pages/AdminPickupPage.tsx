import { PickupConfirm } from '../../collection/components/PickupConfirm';
import { AdminPageContainer } from '../components/AdminPageContainer';

export function AdminPickupPage() {
  return (
    <AdminPageContainer
      title="Coleta no balcão (PDV)"
      description="Identifique o motoboy por telefone ou QR, confirme a coleta e gere a cobrança PIX via API Bixs. O link é enviado ao cliente pelo WhatsApp conectado."
    >
      <PickupConfirm />
    </AdminPageContainer>
  );
}
