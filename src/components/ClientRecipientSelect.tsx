import { useEffect, useRef, useState } from 'react';
import type { ThemeMode } from '../types';
import {
  listRegisteredClients,
  type RegisteredClient,
} from '../services/registeredClientService';
import { RegisterClientModal } from './RegisterClientModal';
import { User, ChevronDown, UserPlus } from 'lucide-react';

interface ClientRecipientSelectProps {
  value: RegisteredClient | null;
  onChange: (client: RegisteredClient | null) => void;
  theme?: ThemeMode;
}

export function ClientRecipientSelect({ value, onChange, theme = 'light' }: ClientRecipientSelectProps) {
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [clients, setClients] = useState<RegisteredClient[]>(() => listRegisteredClients());
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const refreshClients = () => setClients(listRegisteredClients());

  useEffect(() => {
    if (value) {
      setFilterText(
        `${value.name} · ${value.email}${value.phone ? ` · ${value.phone}` : ''}`,
      );
    } else if (!isOpen) {
      setFilterText('');
    }
  }, [value, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (value) {
          setFilterText(
            `${value.name} · ${value.email}${value.phone ? ` · ${value.phone}` : ''}`,
          );
        } else {
          setFilterText('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredClients = clients.filter((client) => {
    if (
      !filterText.trim() ||
      (value &&
        filterText === `${value.name} · ${value.email}${value.phone ? ` · ${value.phone}` : ''}`)
    ) {
      return true;
    }
    const term = filterText.toLowerCase();
    return (
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      (client.phone?.includes(term) ?? false)
    );
  });

  const handleSelect = (client: RegisteredClient) => {
    onChange(client);
    setFilterText(`${client.name} · ${client.email}${client.phone ? ` · ${client.phone}` : ''}`);
    setIsOpen(false);
  };

  const handleFocus = () => {
    refreshClients();
    setIsOpen(true);
    if (value) setFilterText('');
  };

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label
          className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-slate-600'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Cliente destinatário *
        </label>
        <button
          type="button"
          onClick={() => setIsRegisterOpen(true)}
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
            isDark
              ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Cadastrar
        </button>
      </div>

      <div ref={containerRef} className="relative">
        <div
          className={`relative flex items-center rounded-xl border transition-all ${
            isDark
              ? isOpen
                ? 'border-white ring-1 ring-white/20 bg-zinc-900'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              : isOpen
                ? 'border-slate-900 bg-white ring-2 ring-slate-900/10'
                : 'border-slate-300 bg-white shadow-sm hover:border-slate-400'
          }`}
        >
          <input
            type="text"
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={handleFocus}
            onClick={handleFocus}
            placeholder="Buscar cliente por nome, e-mail ou telefone..."
            className={`w-full cursor-pointer bg-transparent py-3 pl-3.5 pr-9 text-sm font-medium focus:outline-none ${
              isDark ? 'text-white placeholder-zinc-500' : 'text-slate-900 placeholder-slate-400'
            }`}
          />
          <ChevronDown
            className={`pointer-events-none absolute right-3 h-4 w-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            } ${isDark ? 'text-zinc-400' : 'text-slate-400'}`}
          />
        </div>

        {isOpen && (
          <div
            className={`absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border shadow-2xl ${
              isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white shadow-slate-300/50'
            }`}
          >
            <div
              className={`border-b px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? 'border-zinc-800 bg-zinc-900/60 text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              Clientes com login
            </div>

            {filteredClients.length === 0 ? (
              <div className="p-4 text-center">
                <p className={`mb-3 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Nenhum cliente encontrado.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsRegisterOpen(true);
                  }}
                  className={`rounded-lg px-4 py-2 text-xs font-bold ${
                    isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                  }`}
                >
                  Cadastrar novo cliente
                </button>
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = value?.userId === client.userId;
                return (
                  <button
                    key={client.userId}
                    type="button"
                    onClick={() => handleSelect(client)}
                    className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 ${
                      isSelected
                        ? isDark
                          ? 'bg-white/10'
                          : 'bg-slate-50'
                        : isDark
                          ? 'border-zinc-900 hover:bg-zinc-900'
                          : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 shrink-0 rounded-full p-2 ${
                        isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {client.name}
                      </p>
                      <p className={`mt-0.5 truncate text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {client.email}
                        {client.phone ? ` · ${client.phone}` : ''}
                      </p>
                      {!client.homeAddress && (
                        <p className={`mt-1 text-[11px] ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                          Sem endereço no portal
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {value && !value.homeAddress && (
        <p className={`mt-2 text-xs ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
          Este cliente ainda não cadastrou endereço no portal — informe o destino manualmente.
        </p>
      )}

      <RegisterClientModal
        isOpen={isRegisterOpen}
        theme={theme}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={(client) => {
          refreshClients();
          onChange(client);
        }}
      />
    </div>
  );
}
