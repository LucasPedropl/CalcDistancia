import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, UserPlus, X } from 'lucide-react';
import type { ResidentLink } from '../../../../types/condominium';
import {
  createResidentLink,
  updateResidentDetails,
} from '../../../../services/condominiumResidentService';
import { formatPhoneMask, isValidPhone } from '../../../../utils/phoneValidation';

interface ResidentFormModalProps {
  condominiumId: string;
  resident?: ResidentLink;
  onClose: () => void;
}

export function ResidentFormModal({ condominiumId, resident, onClose }: ResidentFormModalProps) {
  const [name, setName] = useState(resident?.name ?? '');
  const [phone, setPhone] = useState(resident?.phone ?? '');
  const [unitLabel, setUnitLabel] = useState(resident?.unitLabel ?? '');
  const [documentNumber, setDocumentNumber] = useState(resident?.documentNumber ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Informe o nome do morador.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Informe um telefone válido (com DDD).');
      return;
    }
    if (!unitLabel.trim()) {
      setError('Informe o bloco/apartamento.');
      return;
    }

    setIsSaving(true);
    try {
      if (resident) {
        updateResidentDetails(resident.id, { name, phone, unitLabel, documentNumber });
      } else {
        createResidentLink({ condominiumId, name, phone, unitLabel, documentNumber });
      }
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao salvar o morador.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16 backdrop-blur-sm sm:items-center sm:pt-4">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-slate-900" />
            <h3 className="text-lg font-bold text-slate-900">
              {resident ? 'Editar morador' : 'Autorizar novo morador'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Nome do morador
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Maria Souza"
              autoFocus
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              WhatsApp
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(formatPhoneMask(event.target.value))}
              placeholder="(27) 99999-0000"
              className={inputClass}
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              É por este número que as entregas são vinculadas ao morador.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Bloco / Apartamento
              </span>
              <input
                type="text"
                value={unitLabel}
                onChange={(event) => setUnitLabel(event.target.value)}
                placeholder="Bloco B - 402"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Documento (opcional)
              </span>
              <input
                type="text"
                value={documentNumber}
                onChange={(event) => setDocumentNumber(event.target.value)}
                placeholder="CPF ou RG"
                className={inputClass}
              />
            </label>
          </div>

          {error && (
            <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
