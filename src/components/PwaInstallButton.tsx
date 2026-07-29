import { Download, Smartphone } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface PwaInstallButtonProps {
  variant?: 'primary' | 'ghost';
  className?: string;
}

export function PwaInstallButton({ variant = 'primary', className = '' }: PwaInstallButtonProps) {
  const { canInstall, isInstalled, isIOS, install } = usePwaInstall();

  if (isInstalled) return null;

  const baseStyles =
    variant === 'primary'
      ? 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-900'
      : 'bg-white/80 text-slate-700 hover:text-slate-900 hover:bg-white border border-slate-200 backdrop-blur-sm';

  if (canInstall) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shadow-sm ${baseStyles} ${className}`}
      >
        <Download className="w-4 h-4" />
        Instalar aplicativo
      </button>
    );
  }

  if (isIOS) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 bg-white/80 backdrop-blur-sm ${className}`}
      >
        <Smartphone className="w-4 h-4 shrink-0" />
        No iPhone: toque em Compartilhar → Adicionar à Tela de Início
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 border border-slate-200 bg-white/70 backdrop-blur-sm ${className}`}
    >
      <Download className="w-4 h-4 shrink-0" />
      Para instalar: menu do navegador → Instalar aplicativo
    </div>
  );
}
