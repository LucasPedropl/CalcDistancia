import { useRef, useState } from 'react';
import { Building2, LogOut, MapPin, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  AddressRegistrationForm,
  type AddressRegistrationFormHandle,
} from '../../../components/AddressRegistrationForm';
import { MapLocationPicker } from '../../../components/map/MapLocationPicker';
import {
  registerCondominium,
  type CondominiumProfile,
} from '../../../services/condominiumService';
import type { LocationPoint } from '../../../types';

interface CondominioRegistrationScreenProps {
  userId: string;
  userName: string;
  onSuccess: (profile: CondominiumProfile) => void;
  onLogout: () => void;
}

type RegistrationStep = 'form' | 'map';

export function CondominioRegistrationScreen({
  userId,
  userName,
  onSuccess,
  onLogout,
}: CondominioRegistrationScreenProps) {
  const formRef = useRef<AddressRegistrationFormHandle>(null);
  const [condoName, setCondoName] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<RegistrationStep>('form');
  const [draftLocation, setDraftLocation] = useState<LocationPoint | null>(null);

  const handleContinueToMap = async (event: React.FormEvent) => {
    event.preventDefault();
    setRegisterError(null);
    setIsSubmitting(true);

    try {
      if (!condoName.trim()) {
        setRegisterError('Informe o nome do condomínio.');
        return;
      }

      const location = (await formRef.current?.resolveLocation()) ?? null;
      if (!location) {
        setRegisterError('Preencha o endereço completo do condomínio.');
        return;
      }

      setDraftLocation(location);
      setStep('map');
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Erro ao localizar endereço.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmLocation = () => {
    if (!draftLocation) return;

    setRegisterError(null);
    setIsSubmitting(true);

    try {
      const registered = registerCondominium(userId, condoName, draftLocation);
      onSuccess(registered);
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Erro ao cadastrar condomínio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Painel do Condomínio
              </p>
              <h1 className="text-lg font-bold text-slate-900">Olá, {userName}</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <MapPin className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {step === 'form' ? 'Cadastre o endereço do condomínio' : 'Confirme a localização no mapa'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {step === 'form'
                ? 'Informe o endereço completo. Na próxima etapa você confirma o ponto exato no Google Maps.'
                : 'Ajuste o marcador na portaria do condomínio. Esse ponto será usado para identificar entregas.'}
            </p>
          </div>

          {step === 'form' ? (
            <form onSubmit={(event) => void handleContinueToMap(event)} className="space-y-5">
              <div>
                <label
                  htmlFor="condo-name"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Nome do condomínio
                </label>
                <input
                  id="condo-name"
                  type="text"
                  value={condoName}
                  onChange={(event) => {
                    setCondoName(event.target.value);
                    setRegisterError(null);
                  }}
                  placeholder="Ex.: Residencial Golden Garden"
                  autoFocus
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Use o nome exato que aparece no Google Maps para melhor precisão.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Endereço da portaria
                </p>
                <AddressRegistrationForm
                  ref={formRef}
                  enableStreetSearch
                  numberRequired={false}
                  establishmentName={condoName}
                />
              </div>

              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
                Exemplo: CEP <strong>29934-615</strong>, <strong>Av. Amocim Leite</strong>, bairro{' '}
                <strong>Aviação</strong>, São Mateus/ES — número <strong>S/N</strong>.
              </p>

              {registerError && (
                <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{registerError}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !condoName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Localizando endereço...' : 'Continuar para o mapa'}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              {draftLocation && (
                <MapLocationPicker
                  location={draftLocation}
                  label={condoName}
                  onChange={setDraftLocation}
                />
              )}

              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Endereço: <strong>{draftLocation?.address}</strong>
              </p>

              {registerError && (
                <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{registerError}</span>
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  disabled={isSubmitting || !draftLocation}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Salvando...' : 'Confirmar e entrar'}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
