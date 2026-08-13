import { X } from 'lucide-react';

interface OrderModalHeaderProps {
  stepLabel: string;
  stepIndex: number;
  stepCount: number;
  isDark: boolean;
  onClose: () => void;
}

export function OrderModalHeader({
  stepLabel,
  stepIndex,
  stepCount,
  isDark,
  onClose,
}: OrderModalHeaderProps) {
  return (
    <>
      <div
        className={`flex items-center justify-between border-b p-6 ${
          isDark ? 'border-zinc-800' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl font-black ${
              isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
            }`}
          >
            U
          </div>
          <div>
            <h3 className="text-lg font-bold">Confirmação do Pedido</h3>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{stepLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`rounded-lg p-1.5 transition-colors ${
            isDark
              ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex gap-2 px-6 pt-4">
        {Array.from({ length: stepCount }, (_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}
          >
            <div
              className={`h-full rounded-full transition-all ${
                index <= stepIndex ? (isDark ? 'w-full bg-white' : 'w-full bg-slate-900') : 'w-0'
              }`}
            />
          </div>
        ))}
      </div>
    </>
  );
}
