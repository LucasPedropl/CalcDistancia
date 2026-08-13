import { Building2, LogOut, MapPin } from 'lucide-react';
import type { CondominiumProfile } from '../../../services/condominiumService';
import { CondominioPartnerStatusBadge } from './CondominioPartnerStatusBadge';

interface CondominioHeaderProps {
  profile: CondominiumProfile;
  onEditLocation: () => void;
  onLogout: () => void;
}

export function CondominioHeader({ profile, onEditLocation, onLogout }: CondominioHeaderProps) {
  return (
    <header className="relative z-40 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 font-black text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Painel do Condomínio
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-sm font-bold sm:text-lg">{profile.name}</h1>
            <CondominioPartnerStatusBadge status={profile.partnerStatus} className="hidden sm:inline-flex" />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <CondominioPartnerStatusBadge status={profile.partnerStatus} className="sm:hidden" />
        <button
          type="button"
          onClick={onEditLocation}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Localização</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
