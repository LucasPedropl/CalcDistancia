import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Building2, X } from 'lucide-react';
import {
  AddressRegistrationForm,
  type AddressRegistrationFormHandle,
} from '../../../../components/AddressRegistrationForm';
import { createCondominiumFromBackoffice } from '../../../../services/condominiumPartnerService';
import {
  AdminCondominiumFormFields,
  type AdminCondominiumFormValues,
} from './AdminCondominiumFormFields';

interface AdminCondominiumFormModalProps {
  onClose: () => void;
}

const EMPTY_VALUES: AdminCondominiumFormValues = {
  name: '',
  email: '',
  cnpj: '',
  unitsCount: '',
  presidentName: '',
  presidentPhone: '',
  planId: '',
};

export function AdminCondominiumFormModal({ onClose }: AdminCondominiumFormModalProps) {
  const addressFormRef = useRef<AddressRegistrationFormHandle>(null);
  const [values, setValues] = useState<AdminCondominiumFormValues>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError('Informe o nome do condomínio.');
      return;
    }
    if (!values.email.trim()) {
      setError('Informe o e-mail de acesso do condomínio.');
      return;
    }

    setIsSaving(true);
    try {
      const address = await addressFormRef.current?.resolveLocation();
      if (!address) {
        setError('Preencha o endereço completo da portaria.');
        return;
      }

      createCondominiumFromBackoffice({
        email: values.email,
        name: values.name,
        address,
        planId: values.planId || undefined,
        details: {
          cnpj: values.cnpj,
          presidentName: values.presidentName,
          presidentPhone: values.presidentPhone,
          unitsCount: values.unitsCount ? Number(values.unitsCount) : undefined,
        },
      });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao cadastrar o condomínio.');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-10 backdrop-blur-sm">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-900" />
            <h3 className="text-lg font-bold text-slate-900">Cadastrar condomínio</h3>
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
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            O condomínio cadastrado aqui já entra como parceiro e acessa o painel com o e-mail
            informado.
          </p>

          <AdminCondominiumFormFields
            values={values}
            onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Endereço da portaria
            </p>
            <AddressRegistrationForm
              ref={addressFormRef}
              enableStreetSearch
              numberRequired={false}
              establishmentName={values.name}
            />
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
            {isSaving ? 'Salvando...' : 'Cadastrar condomínio'}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
