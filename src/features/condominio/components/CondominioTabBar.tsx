import { NavLink } from 'react-router-dom';
import { Building2, ClipboardList, FileText, History, Package, Users } from 'lucide-react';

interface CondominioTabBarProps {
  pendingResidentCount: number;
}

const TABS = [
  { to: '/condominio', label: 'Entregas', icon: Package, end: true },
  { to: '/condominio/documentos', label: 'Documentos', icon: FileText, end: false },
  { to: '/condominio/moradores', label: 'Moradores', icon: Users, end: false },
  { to: '/condominio/auditoria', label: 'Auditoria', icon: ClipboardList, end: false },
  { to: '/condominio/historico', label: 'Histórico', icon: History, end: false },
  { to: '/condominio/perfil', label: 'Perfil', icon: Building2, end: false },
] as const;

export function CondominioTabBar({ pendingResidentCount }: CondominioTabBarProps) {
  return (
    <nav
      aria-label="Seções do painel do condomínio"
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 sm:px-4"
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `relative flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
          {to === '/condominio/moradores' && pendingResidentCount > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">
              {pendingResidentCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
