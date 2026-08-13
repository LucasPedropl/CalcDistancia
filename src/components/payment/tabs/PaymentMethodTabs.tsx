import type { LucideIcon } from 'lucide-react';

export interface PaymentMethodTabOption<TId extends string> {
  id: TId;
  label: string;
  icon: LucideIcon;
}

interface PaymentMethodTabsProps<TId extends string> {
  options: PaymentMethodTabOption<TId>[];
  activeId: TId;
  onChange: (id: TId) => void;
  isDark?: boolean;
}

export function PaymentMethodTabs<TId extends string>({
  options,
  activeId,
  onChange,
  isDark = false,
}: PaymentMethodTabsProps<TId>) {
  return (
    <div
      role="tablist"
      aria-label="Formas de pagamento"
      className={`flex gap-1 rounded-xl border p-1 ${
        isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-100'
      }`}
    >
      {options.map(({ id, label, icon: Icon }) => {
        const isActive = id === activeId;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
              isActive
                ? isDark
                  ? 'bg-white text-black'
                  : 'bg-white text-slate-900 shadow-sm'
                : isDark
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
