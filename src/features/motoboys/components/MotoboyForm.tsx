import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  getDefaultMotoboyProfile,
  saveMotoboyProfile,
  type MotoboyProfile,
} from '../../../services/motoboyProfileService';
import { formatPhoneMask, isValidPhone } from '../../../utils/phoneValidation';
import { User, Phone, Mail, Car, MapPin, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { MotoboyQrCard } from '../../collection/components/PickupConfirm';
import type { ThemeMode } from '../../../types';

interface MotoboyFormProps {
  theme?: ThemeMode;
}

export function MotoboyForm({ theme = 'light' }: MotoboyFormProps) {
  const { user } = useAuth();
  const motoboyId = user?.id ?? 'mb-001';
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState<MotoboyProfile>(() =>
    getDefaultMotoboyProfile(motoboyId, user?.name ?? 'Motoboy', user?.email ?? '')
  );
  const [savedMessage, setSavedMessage] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(getDefaultMotoboyProfile(motoboyId, user?.name ?? 'Motoboy', user?.email ?? ''));
  }, [motoboyId, user?.name, user?.email]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;

    if (name === 'telefone') {
      setPhoneError(null);
      setFormData((prev) => ({
        ...prev,
        telefone: formatPhoneMask(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    if (!isValidPhone(formData.telefone)) {
      setPhoneError('Informe um telefone/WhatsApp válido com DDD.');
      return;
    }

    setPhoneError(null);
    saveMotoboyProfile(formData);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const inputClass = `w-full rounded-xl border py-3 px-4 text-sm font-medium focus:outline-none ${
    isDark
      ? 'border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 focus:border-white'
      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900'
  }`;

  const labelClass = `mb-2 block text-xs font-semibold uppercase tracking-wider ${
    isDark ? 'text-zinc-400' : 'text-slate-500'
  }`;

  return (
    <div
      className={`overflow-hidden rounded-2xl border shadow-xl ${
        isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white shadow-slate-900/5'
      }`}
    >
      <div className={`border-b p-8 ${isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50/80'}`}>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
            }`}
          >
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Perfil do Entregador</h2>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Dados salvos localmente no seu dispositivo
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nome" className={labelClass}>
              Nome completo
            </label>
            <input
              type="text"
              name="nome"
              id="nome"
              value={formData.nome}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="telefone" className={labelClass}>
              Telefone / WhatsApp
            </label>
            <div className="relative">
              <Phone className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
              <input
                type="text"
                name="telefone"
                id="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
                placeholder="(31) 99999-9999"
                required
              />
            </div>
            {phoneError && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3.5 w-3.5" />
                {phoneError}
              </p>
            )}
            <p className={`mt-1.5 text-xs ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              Usado para identificação no balcão e notificações internas no app.
            </p>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              E-mail
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="veiculo" className={labelClass}>
              Veículo
            </label>
            <div className="relative">
              <Car className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
              <select
                id="veiculo"
                name="veiculo"
                value={formData.veiculo}
                onChange={handleChange}
                className={`${inputClass} pl-10 appearance-none`}
              >
                <option value="MOTO">Moto</option>
                <option value="CARRO">Carro</option>
                <option value="BIKE">Bicicleta</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="placa" className={labelClass}>
              Placa
            </label>
            <input
              type="text"
              name="placa"
              id="placa"
              value={formData.placa}
              onChange={handleChange}
              className={inputClass}
              placeholder="ABC-1D23"
            />
          </div>

          <div>
            <label htmlFor="cpf" className={labelClass}>
              CPF
            </label>
            <input
              type="text"
              name="cpf"
              id="cpf"
              value={formData.cpf}
              onChange={handleChange}
              className={inputClass}
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <label htmlFor="bairro" className={labelClass}>
              Bairro
            </label>
            <input
              type="text"
              name="bairro"
              id="bairro"
              value={formData.bairro}
              onChange={handleChange}
              className={inputClass}
              placeholder="Centro"
            />
          </div>

          <div>
            <label htmlFor="cidade" className={labelClass}>
              Cidade de atuação
            </label>
            <div className="relative">
              <MapPin className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
              <input
                type="text"
                name="cidade"
                id="cidade"
                value={formData.cidade}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="estado" className={labelClass}>
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              <option value="MG">Minas Gerais</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
            </select>
          </div>
        </div>

        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <input
            id="publico"
            name="publico"
            type="checkbox"
            checked={formData.publico}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />
          <div>
            <label htmlFor="publico" className="text-sm font-bold">
              Perfil público
            </label>
            <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Permite que clientes encontrem você no mapa para solicitações diretas.
            </p>
          </div>
        </div>

        <MotoboyQrCard motoboyId={motoboyId} />

        <div className="flex items-center justify-end gap-3">
          {savedMessage && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
              <CheckCircle className="h-4 w-4" />
              Salvo!
            </span>
          )}
          <button
            type="submit"
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
              isDark
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Save className="h-4 w-4" />
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}
