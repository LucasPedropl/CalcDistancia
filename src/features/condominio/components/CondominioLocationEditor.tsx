import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { MapLocationPicker } from '../../../components/map/MapLocationPicker';
import {
  updateCondominiumLocation,
  type CondominiumProfile,
} from '../../../services/condominiumService';
import type { LocationPoint } from '../../../types';

interface CondominioLocationEditorProps {
  profile: CondominiumProfile;
  onSaved: (profile: CondominiumProfile) => void;
  onCancel: () => void;
}

export function CondominioLocationEditor({
  profile,
  onSaved,
  onCancel,
}: CondominioLocationEditorProps) {
  const [draftLocation, setDraftLocation] = useState<LocationPoint>(profile.address);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setError(null);
    setIsSaving(true);
    try {
      const updated = updateCondominiumLocation(profile.userId, draftLocation);
      onSaved(updated);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao salvar localização.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-slate-900" />
            <h2 className="text-lg font-bold text-slate-900">Alterar localização do condomínio</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Arraste o pin no mapa para corrigir a posição de <strong>{profile.name}</strong>.
          </p>
        </div>

        <div className="min-h-[320px] flex-1">
          <MapLocationPicker
            location={draftLocation}
            onChange={setDraftLocation}
          />
        </div>

        <div className="space-y-3 border-t border-slate-200 p-5">
          <p className="text-xs text-slate-600">
            <strong>Endereço:</strong> {draftLocation.address}
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSaving ? 'Salvando...' : 'Salvar localização'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
