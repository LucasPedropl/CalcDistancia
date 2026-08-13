import { BixPayCredentialsForm } from '../../../components/payment/BixPayCredentialsForm';
import { LedgerStatementPanel } from '../../../components/payment/LedgerStatementPanel';
import { AdminPageContainer } from '../components/AdminPageContainer';
import { SplitConfigForm } from '../components/SplitConfigForm';

export function AdminPaymentsPage() {
  return (
    <AdminPageContainer
      title="Pagamentos"
      description="Credenciais Bix Pay da plataforma, regra de rateio do pagamento dividido e caderneta digital consolidada."
    >
      <div className="space-y-5">
        <BixPayCredentialsForm
          scope="GLOBAL"
          ownerId="platform"
          title="Credenciais Bix Pay da plataforma"
          description="Conta que recebe a taxa da plataforma nas corridas com pagamento dividido."
        />

        <SplitConfigForm />

        <LedgerStatementPanel
          ownerType="PLATFORM"
          ownerId="platform"
          title="Caderneta da plataforma"
          maxEntries={20}
        />
      </div>
    </AdminPageContainer>
  );
}
