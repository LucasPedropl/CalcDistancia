import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { paymentApi } from '../../../services/paymentApi';
import { whatsappApi } from '../../../services/whatsappApi';
import {
  confirmPickup,
  getAllOrders,
  getOrderById,
  markOrderPaymentPaid,
} from '../../../services/orderService';
import { createPaymentRecord, markPaymentPaid } from '../../../services/paymentRecordService';
import { generateOrderReceiptBlob } from '../../../services/receiptService';
import {
  buildMotoboyQrPayload,
  encodeMotoboyQrPayload,
  findMotoboyByPhone,
  parseMotoboyQrPayload,
  resolveMotoboyDisplayName,
  type MotoboyQrPayload,
} from '../../../services/motoboyIdentificationService';
import { formatPhoneMask, isValidPhone } from '../../../utils/phoneValidation';
import type { DeliveryOrder } from '../../../types/order';
import {
  AlertCircle,
  Bike,
  CheckCircle2,
  Loader2,
  Package,
  QrCode,
  Search,
} from 'lucide-react';

type PickupStep = 'IDENTIFY' | 'CONFIRM' | 'WAITING_PAYMENT' | 'PAID';

export function PickupConfirm() {
  const [step, setStep] = useState<PickupStep>('IDENTIFY');
  const [motoboySearch, setMotoboySearch] = useState('');
  const [identifiedMotoboy, setIdentifiedMotoboy] = useState<MotoboyQrPayload | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [clientPhone, setClientPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pixEmv, setPixEmv] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [pendingOrders, setPendingOrders] = useState<DeliveryOrder[]>([]);

  const refreshOrders = () => {
    const orders = getAllOrders().filter(
      (o) => o.status === 'PENDING' || o.status === 'ACCEPTED',
    );
    setPendingOrders(orders);
  };

  useEffect(() => {
    refreshOrders();
    const interval = window.setInterval(refreshOrders, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const handleIdentifyByPhone = () => {
    setError(null);
    const found = findMotoboyByPhone(motoboySearch);
    if (!found) {
      setError('Motoboy não encontrado. Verifique telefone ou leia o QR Code.');
      return;
    }
    setIdentifiedMotoboy(found);
    setStep('CONFIRM');
  };

  const handleQrInput = () => {
    setError(null);
    const parsed = parseMotoboyQrPayload(motoboySearch);
    if (!parsed) {
      setError('QR Code ou código inválido.');
      return;
    }
    setIdentifiedMotoboy(parsed);
    setStep('CONFIRM');
  };

  const handleConfirmPickup = async () => {
    if (!identifiedMotoboy) return;

    const order =
      (selectedOrderId ? getOrderById(selectedOrderId) : null) ??
      pendingOrders.find((o) => o.targetMotoboyId === identifiedMotoboy.motoboyId) ??
      pendingOrders[0];

    if (!order) {
      setError('Nenhum pedido pendente encontrado para esta coleta.');
      return;
    }

    if (!isValidPhone(clientPhone)) {
      setPhoneError('Informe um telefone válido do cliente para envio do PIX.');
      return;
    }

    setPhoneError(null);
    setError(null);
    setIsLoading(true);

    try {
      const valor = order.price ?? 0;
      const pix = await paymentApi.gerarPix({
        valor,
        descricao: `Entrega ${order.id}`,
        telefoneCliente: clientPhone,
        nomeCliente: order.clientName,
        orderId: order.id,
        origem: order.origin.address,
        destino: order.destination.address,
      });

      createPaymentRecord({
        orderId: order.id,
        invoiceId: pix.invoiceId,
        externalCode: pix.externalCode,
        amountCents: Math.round(valor * 100),
        pixEmv: pix.pixCopiaECola,
      });

      const updated = confirmPickup(
        order.id,
        identifiedMotoboy.motoboyId,
        resolveMotoboyDisplayName(identifiedMotoboy),
        { invoiceId: pix.invoiceId, pixEmv: pix.pixCopiaECola },
      );

      const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(order.destination.address)}`;
      await whatsappApi.enviarCobranca(
        clientPhone,
        pix.pixCopiaECola,
        valor,
        order.origin.address,
        order.destination.address,
        mapsUrl,
      );

      setActiveOrder(updated);
      setPixEmv(pix.pixCopiaECola);
      setStep('WAITING_PAYMENT');
      refreshOrders();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro ao confirmar coleta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentConfirmed = async () => {
    if (!activeOrder) return;
    setIsLoading(true);
    try {
      markPaymentPaid(activeOrder.id);
      const paidOrder = markOrderPaymentPaid(activeOrder.id);
      if (!paidOrder) return;

      const receiptUrl = generateOrderReceiptBlob(paidOrder, new Date().toISOString());
      await whatsappApi.enviarComprovante(
        clientPhone,
        receiptUrl,
        paidOrder.clientName,
      );

      setStep('PAID');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro ao confirmar pagamento.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('IDENTIFY');
    setMotoboySearch('');
    setIdentifiedMotoboy(null);
    setSelectedOrderId('');
    setClientPhone('');
    setPixEmv(null);
    setActiveOrder(null);
    setError(null);
    setPhoneError(null);
    refreshOrders();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Coleta no Balcão (PDV)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Identifique o motoboy, confirme a coleta e dispare o PIX via API Bixs + WhatsApp.
        </p>
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {step === 'IDENTIFY' && (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Telefone do motoboy ou cole o QR
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={motoboySearch}
                onChange={(e) => setMotoboySearch(e.target.value)}
                placeholder="(31) 99999-9999 ou uaipdv://motoboy/..."
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm"
              />
            </div>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleIdentifyByPhone}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white"
            >
              <Bike className="h-4 w-4" />
              Buscar por telefone
            </button>
            <button
              type="button"
              onClick={handleQrInput}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <QrCode className="h-4 w-4" />
              Validar QR
            </button>
          </div>
        </div>
      )}

      {step === 'CONFIRM' && identifiedMotoboy && (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-800">
              Motoboy: {resolveMotoboyDisplayName(identifiedMotoboy)}
            </p>
            <p className="text-xs text-emerald-700">ID: {identifiedMotoboy.motoboyId}</p>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Pedido
            </span>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm"
            >
              <option value="">Selecione automaticamente</option>
              {pendingOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} — {order.clientName} — R$ {(order.price ?? 0).toFixed(2)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Telefone do cliente (WhatsApp)
            </span>
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => {
                setClientPhone(formatPhoneMask(e.target.value));
                setPhoneError(null);
              }}
              placeholder="(31) 99999-9999"
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm"
            />
            {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
          </label>

          <button
            type="button"
            onClick={() => void handleConfirmPickup()}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
            Confirmar coleta e enviar PIX
          </button>
        </div>
      )}

      {step === 'WAITING_PAYMENT' && pixEmv && activeOrder && (
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-500" />
          <h3 className="text-lg font-bold">Aguardando pagamento PIX</h3>
          <p className="text-sm text-slate-500">
            Cobrança enviada para <strong>{clientPhone}</strong>
          </p>
          <div className="flex justify-center">
            <QRCodeSVG value={pixEmv} size={180} />
          </div>
          <p className="break-all rounded-lg bg-slate-50 p-3 text-left font-mono text-xs text-slate-600">
            {pixEmv}
          </p>
          <button
            type="button"
            onClick={() => void handlePaymentConfirmed()}
            disabled={isLoading}
            className="w-full rounded-xl border border-emerald-300 bg-emerald-50 py-3 text-sm font-bold text-emerald-800"
          >
            Simular webhook PIX pago (dev)
          </button>
        </div>
      )}

      {step === 'PAID' && (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="text-lg font-bold">Pagamento confirmado!</h3>
          <p className="text-sm text-slate-500">Comprovante enviado via WhatsApp.</p>
          <button type="button" onClick={resetFlow} className="text-sm font-semibold text-slate-900">
            Nova coleta
          </button>
        </div>
      )}
    </div>
  );
}

export function MotoboyQrCard({ motoboyId }: { motoboyId: string }) {
  const payload = buildMotoboyQrPayload(motoboyId);
  if (!payload) return null;
  const encoded = encodeMotoboyQrPayload(payload);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Seu QR de identificação</p>
      <div className="flex justify-center">
        <QRCodeSVG value={encoded} size={140} />
      </div>
      <p className="mt-2 text-xs text-slate-500">Apresente no balcão para confirmar coleta</p>
    </div>
  );
}
