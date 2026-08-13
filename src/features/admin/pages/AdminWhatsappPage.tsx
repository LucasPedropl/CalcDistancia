import { AdminPageContainer } from '../components/AdminPageContainer';
import { AdminWhatsappConnect } from '../components/AdminWhatsappConnect';

export function AdminWhatsappPage() {
  return (
    <AdminPageContainer
      title="Integração WhatsApp"
      description="Conecte o número da empresa que dispara cobranças PIX, comprovantes e avisos de corrida. Painel separado dos fluxos de cliente e motoboy."
    >
      <AdminWhatsappConnect />

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-900">Clientes</h3>
          <p className="mt-2 text-sm text-slate-600">
            Recebem cobrança PIX após a coleta e comprovante após o pagamento. Telefone cadastrado
            em Configurações → Conta ou informado no pedido.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-900">Motoboys</h3>
          <p className="mt-2 text-sm text-slate-600">
            Recebem notificações internas no app ao aceitar corridas. Identificação no balcão via QR
            Code ou telefone cadastrado no perfil.
          </p>
        </div>
      </section>
    </AdminPageContainer>
  );
}
