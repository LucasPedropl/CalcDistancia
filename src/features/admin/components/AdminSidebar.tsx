import { NavLink } from 'react-router-dom';
import {
  Building2,
  FileSignature,
  LayoutDashboard,
  MessageCircle,
  Package,
  Sparkles,
  Wallet,
} from 'lucide-react';

interface AdminSidebarProps {
  pendingCondominiumCount: number;
}

const NAV_ITEMS = [
  { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/admin/condominios', label: 'Condomínios', icon: Building2, end: false },
  { to: '/admin/planos', label: 'Planos', icon: Sparkles, end: false },
  { to: '/admin/pagamentos', label: 'Pagamentos', icon: Wallet, end: false },
  { to: '/admin/contratos', label: 'Contratos', icon: FileSignature, end: false },
  { to: '/admin/whatsapp', label: 'WhatsApp', icon: MessageCircle, end: false },
  { to: '/admin/coleta', label: 'Coleta PDV', icon: Package, end: false },
] as const;

export function AdminSidebar({ pendingCondominiumCount }: AdminSidebarProps) {
  return (
    <nav
      aria-label="Seções da retaguarda"
      className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 lg:h-full lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-3 lg:py-4"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-colors lg:rounded-xl lg:border-b-0 lg:py-2.5 ${
              isActive
                ? 'border-slate-900 text-slate-900 lg:bg-slate-900 lg:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 lg:hover:bg-slate-100'
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
          {to === '/admin/condominios' && pendingCondominiumCount > 0 && (
            <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">
              {pendingCondominiumCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
