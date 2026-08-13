import { Copy, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PixPaymentTabProps {
  pixCode: string;
  isDark: boolean;
  isProcessing: boolean;
  isCopied: boolean;
  qrSize?: number;
  confirmLabel: string;
  onCopy: () => void;
  onConfirm: () => void;
}

export function PixPaymentTab({
  pixCode,
  isDark,
  isProcessing,
  isCopied,
  qrSize = 180,
  confirmLabel,
  onCopy,
  onConfirm,
}: PixPaymentTabProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4">
        <QRCodeSVG value={pixCode} size={qrSize} />
      </div>

      <div
        className={`max-h-20 overflow-y-auto rounded-xl border p-3 font-mono text-[10px] leading-relaxed break-all ${
          isDark
            ? 'border-zinc-800 bg-zinc-900 text-zinc-300'
            : 'border-slate-200 bg-slate-50 text-slate-700'
        }`}
      >
        {pixCode}
      </div>

      <button
        type="button"
        onClick={onCopy}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
          isDark
            ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-900'
            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Copy className="h-4 w-4" />
        {isCopied ? 'Copiado!' : 'Copiar chave PIX'}
      </button>

      <button
        type="button"
        onClick={onConfirm}
        disabled={isProcessing}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-60 ${
          isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isProcessing ? 'Processando PIX...' : confirmLabel}
      </button>
    </div>
  );
}
