import { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, ShieldAlert, Wallet } from 'lucide-react';
import {
  loadBixPayCredentials,
  saveBixPayCredentials,
  testBixPayConnection,
  type BixPayCredentials,
  type BixPayEnvironment,
  type BixPayScope,
} from '../../services/bixPayService';

interface BixPayCredentialsFormProps {
  scope: BixPayScope;
  ownerId: string;
  title?: string;
  description?: string;
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

export function BixPayCredentialsForm({
  scope,
  ownerId,
  title = 'Credenciais Bix Pay',
  description = 'Informe as credenciais fornecidas pela Bix Pay para receber pagamentos por esta conta.',
}: BixPayCredentialsFormProps) {
  const stored = loadBixPayCredentials(scope, ownerId);
  const [merchantId, setMerchantId] = useState(stored?.merchantId ?? '');
  const [accessToken, setAccessToken] = useState(stored?.accessToken ?? '');
  const [accessPassword, setAccessPassword] = useState(stored?.accessPassword ?? '');
  const [pixKey, setPixKey] = useState(stored?.pixKey ?? '');
  const [environment, setEnvironment] = useState<BixPayEnvironment>(
    stored?.environment ?? 'SANDBOX',
  );
  const [isSecretVisible, setIsSecretVisible] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const buildCredentials = (): BixPayCredentials => ({
    scope,
    ownerId,
    merchantId,
    accessToken,
    accessPassword,
    pixKey,
    environment,
  });

  const handleSave = () => {
    setError(null);
    if (!merchantId.trim() || !accessToken.trim()) {
      setError('Informe o ID do estabelecimento e o token de acesso.');
      return;
    }

    saveBixPayCredentials(buildCredentials());
    setSuccessMessage('Credenciais salvas neste navegador.');
  };

  const handleTestConnection = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsTesting(true);

    try {
      const result = await testBixPayConnection(buildCredentials());
      saveBixPayCredentials(buildCredentials());
      setSuccessMessage(result.message);
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : 'Falha ao testar a conexão.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-slate-900" />
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">{description}</p>

      <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Demonstração: token e senha ficam salvos no navegador, sem criptografia. Não use
        credenciais reais de produção.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
            ID do estabelecimento
          </span>
          <input
            type="text"
            value={merchantId}
            onChange={(event) => setMerchantId(event.target.value)}
            placeholder="BIX-000000"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Ambiente
          </span>
          <select
            value={environment}
            onChange={(event) => setEnvironment(event.target.value as BixPayEnvironment)}
            className={inputClass}
          >
            <option value="SANDBOX">Sandbox (testes)</option>
            <option value="PRODUCTION">Produção</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Token de acesso
          </span>
          <input
            type={isSecretVisible ? 'text' : 'password'}
            value={accessToken}
            onChange={(event) => setAccessToken(event.target.value)}
            placeholder="••••••••••••"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Senha de acesso
          </span>
          <input
            type={isSecretVisible ? 'text' : 'password'}
            value={accessPassword}
            onChange={(event) => setAccessPassword(event.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Chave PIX de recebimento (opcional)
          </span>
          <input
            type="text"
            value={pixKey}
            onChange={(event) => setPixKey(event.target.value)}
            placeholder="CNPJ, telefone ou chave aleatória"
            className={inputClass}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setIsSecretVisible((visible) => !visible)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        {isSecretVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {isSecretVisible ? 'Ocultar credenciais' : 'Mostrar credenciais'}
      </button>

      {error && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {successMessage && !error && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {successMessage}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          Salvar credenciais
        </button>
        <button
          type="button"
          onClick={() => void handleTestConnection()}
          disabled={isTesting}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          {isTesting ? 'Testando...' : 'Testar conexão'}
        </button>
      </div>
    </section>
  );
}
