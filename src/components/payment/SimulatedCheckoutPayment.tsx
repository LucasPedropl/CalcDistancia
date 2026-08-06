import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  QrCode,
} from 'lucide-react';
import type { OrderPaymentMethod } from '../../types/order';
import type { ThemeMode } from '../../types';
import { formatCurrency } from '../../services/pricingService';

interface SimulatedCheckoutPaymentProps {
  amount: number | null;
  theme?: ThemeMode;
  onPaymentComplete: (method: OrderPaymentMethod) => void;
}

type MethodTab = 'PIX' | 'CARD';

function buildSimulatedPixCode(amount: number): string {
  return `00020126580014br.gov.bcb.pix0136sim-${Date.now()}520400005303986540${amount.toFixed(2)}5802BR5925Calc Distancia Simulado6009SAO MATEUS62070503***6304SIMU`;
}

export function SimulatedCheckoutPayment({
  amount,
  theme = 'light',
  onPaymentComplete,
}: SimulatedCheckoutPaymentProps) {
  const isDark = theme === 'dark';
  const resolvedAmount = amount !== null && amount > 0 ? amount : 25;
  const [method, setMethod] = useState<MethodTab>('PIX');
  const [pixCode] = useState(() => buildSimulatedPixCode(resolvedAmount));
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCardError('Não foi possível copiar o código PIX.');
    }
  };

  const completePayment = (paymentMethod: OrderPaymentMethod) => {
    setIsProcessing(true);
    window.setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      onPaymentComplete(paymentMethod);
    }, 900);
  };

  const handlePixPay = () => {
    completePayment('PIX');
  };

  const handleCardPay = () => {
    setCardError(null);
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13) {
      setCardError('Informe um número de cartão válido.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
      setCardError('Validade no formato MM/AA.');
      return;
    }
    if (cardCvv.replace(/\D/g, '').length < 3) {
      setCardError('CVV inválido.');
      return;
    }
    completePayment('CARD');
  };

  if (isPaid) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-8 text-emerald-800">
        <CheckCircle2 className="h-12 w-12" />
        <p className="text-lg font-bold">Pagamento confirmado!</p>
        <p className="text-center text-sm">
          {method === 'PIX' ? 'PIX' : 'Cartão'} processado com sucesso (simulação).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border p-4 text-center ${
          isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total a pagar</p>
        <p className="mt-1 text-3xl font-black">{formatCurrency(resolvedAmount)}</p>
      </div>

      <div
        className={`flex gap-1 rounded-xl border p-1 ${
          isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-100'
        }`}
      >
        <button
          type="button"
          onClick={() => setMethod('PIX')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
            method === 'PIX'
              ? isDark
                ? 'bg-white text-black'
                : 'bg-white text-slate-900 shadow-sm'
              : isDark
                ? 'text-zinc-400'
                : 'text-slate-600'
          }`}
        >
          <QrCode className="h-3.5 w-3.5" />
          PIX
        </button>
        <button
          type="button"
          onClick={() => setMethod('CARD')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
            method === 'CARD'
              ? isDark
                ? 'bg-white text-black'
                : 'bg-white text-slate-900 shadow-sm'
              : isDark
                ? 'text-zinc-400'
                : 'text-slate-600'
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          Cartão
        </button>
      </div>

      {method === 'PIX' ? (
        <div className="space-y-3">
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4">
            <QRCodeSVG value={pixCode} size={180} />
          </div>
          <div
            className={`max-h-20 overflow-y-auto rounded-xl border p-3 font-mono text-[10px] leading-relaxed break-all ${
              isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-300' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            {pixCode}
          </div>
          <button
            type="button"
            onClick={() => void handleCopyPix()}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold ${
              isDark ? 'border-zinc-700 text-zinc-300' : 'border-slate-300 text-slate-700'
            }`}
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copiado!' : 'Copiar chave PIX'}
          </button>
          <button
            type="button"
            onClick={handlePixPay}
            disabled={isProcessing}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isProcessing ? 'Processando PIX...' : 'Simular pagamento PIX'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Número do cartão"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className={`w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 ${
              isDark
                ? 'border-zinc-800 bg-zinc-900 text-white focus:ring-white'
                : 'border-slate-300 bg-white focus:ring-slate-900'
            }`}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="MM/AA"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
              className={`rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 ${
                isDark
                  ? 'border-zinc-800 bg-zinc-900 text-white focus:ring-white'
                  : 'border-slate-300 bg-white focus:ring-slate-900'
              }`}
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="CVV"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value)}
              className={`rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 ${
                isDark
                  ? 'border-zinc-800 bg-zinc-900 text-white focus:ring-white'
                  : 'border-slate-300 bg-white focus:ring-slate-900'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={handleCardPay}
            disabled={isProcessing}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {isProcessing ? 'Processando cartão...' : 'Pagar com cartão (simulado)'}
          </button>
        </div>
      )}

      {(cardError) && (
        <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {cardError}
        </p>
      )}
    </div>
  );
}
