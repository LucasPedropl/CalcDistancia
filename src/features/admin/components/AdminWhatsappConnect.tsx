import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, RefreshCw, Smartphone } from 'lucide-react';
import {
  createInstance,
  deleteInstance,
  getInstanceQrCode,
  getInstanceStatus,
  isInstanceConnected,
  listInstances,
  loginBixs,
} from '../../../services/bixsWhatsappService';
import { BIXS_API_ROUTES } from '../../../constants/bixsApi';

const INSTANCE_NAME_PREFIX = 'calc-distancia';

export function AdminWhatsappConnect() {
  const [token, setToken] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('Inicializando conexão...');
  const [instanceId, setInstanceId] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeRef = useRef(true);

  const checkStatusAndLoadQrCode = async (authToken: string, id: number) => {
    if (!activeRef.current) return;

    try {
      setIsLoading(true);
      const currentStatus = await getInstanceStatus(authToken, id);

      if (activeRef.current) {
        setConnectionStatus(currentStatus);
      }

      if (isInstanceConnected(currentStatus)) {
        setStatusMsg('WhatsApp da empresa conectado!');
        setQrCodeData(null);
        return;
      }

      setStatusMsg('Gerando QR Code...');
      const rawCode = await getInstanceQrCode(authToken, id);

      if (activeRef.current) {
        setQrCodeData(rawCode);
        setErrorMsg(null);
        setStatusMsg('Escaneie o QR Code com o WhatsApp da empresa.');
      }
    } catch (error) {
      if (activeRef.current) {
        const message = error instanceof Error ? error.message : 'Falha ao gerar QR Code';
        setErrorMsg(message);
        setQrCodeData(null);
        setStatusMsg('Erro ao conectar. Tente atualizar ou criar nova instância.');
      }
    } finally {
      if (activeRef.current) setIsLoading(false);
    }
  };

  const setupWhatsapp = async (forceNew = false) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      setStatusMsg('Autenticando no gateway Bixs...');
      const authToken = await loginBixs();
      if (activeRef.current) setToken(authToken);

      let targetId: number | null = null;

      if (!forceNew) {
        setStatusMsg('Buscando instâncias existentes...');
        const instances = await listInstances(authToken);
        if (instances.length > 0) {
          targetId = instances[0].id;
          setStatusMsg(`Instância encontrada (${targetId}).`);
        }
      }

      if (targetId === null) {
        setStatusMsg('Criando nova instância...');
        const instanceName = `${INSTANCE_NAME_PREFIX}-${Date.now()}`;
        targetId = await createInstance(authToken, instanceName);
        setStatusMsg(`Nova instância criada (${targetId}).`);
      }

      if (activeRef.current) setInstanceId(targetId);
      await checkStatusAndLoadQrCode(authToken, targetId);
    } catch (error) {
      if (activeRef.current) {
        const message = error instanceof Error ? error.message : 'Erro inesperado';
        setErrorMsg(message);
        setStatusMsg(`Erro: ${message}`);
      }
    } finally {
      if (activeRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    activeRef.current = true;
    setupWhatsapp();

    return () => {
      activeRef.current = false;
    };
  }, []);

  const handleGenerateQrCode = () => {
    if (token && instanceId) {
      checkStatusAndLoadQrCode(token, instanceId);
    }
  };

  const handleForceNewInstance = async () => {
    if (!token) return;

    if (instanceId) {
      try {
        setStatusMsg(`Excluindo instância ${instanceId}...`);
        await deleteInstance(token, instanceId);
        setInstanceId(null);
        setQrCodeData(null);
        setConnectionStatus('');
      } catch (error) {
        console.error('Falha ao excluir instância', error);
      }
    }

    setupWhatsapp(true);
  };

  const connected = isInstanceConnected(connectionStatus);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">WhatsApp da Empresa</h2>
            <p className="mt-1 text-sm text-slate-500">
              Conecte o número oficial da empresa. Este canal envia cobranças PIX, comprovantes e
              notificações para clientes e motoboys com telefone cadastrado.
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Requisito de cadastro</p>
          <p className="mt-1 text-amber-800">
            Clientes e motoboys precisam ter telefone válido no perfil para receber mensagens.
          </p>
        </div>

        {instanceId && (
          <div className="mb-4 text-center">
            <p className="font-mono text-xs text-slate-500">Instância ID: {instanceId}</p>
            {connectionStatus && (
              <p
                className={`mt-1 text-sm font-bold uppercase ${
                  connected ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                Status: {connectionStatus}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col items-center rounded-xl bg-slate-50 p-6">
          {errorMsg ? (
            <div className="flex h-[250px] w-[250px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4">
              <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
              <p className="text-center text-sm font-medium text-red-700">{errorMsg}</p>
            </div>
          ) : connected ? (
            <div className="flex h-[250px] w-[250px] flex-col items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="mb-2 h-16 w-16 text-emerald-500" />
              <p className="font-semibold text-emerald-700">WhatsApp Conectado!</p>
              <p className="mt-2 px-4 text-center text-xs text-emerald-600">
                Pronto para enviar mensagens aos clientes e motoboys.
              </p>
            </div>
          ) : qrCodeData ? (
            <div className="flex flex-col items-center">
              <div className="mb-4 rounded-lg border bg-white p-2 shadow-sm">
                <QRCodeSVG value={qrCodeData} size={250} />
              </div>
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Smartphone className="h-4 w-4" />
                Abra o WhatsApp → Aparelhos conectados → Conectar
              </p>
            </div>
          ) : (
            <div className="flex h-[250px] w-[250px] animate-pulse flex-col items-center justify-center rounded-lg bg-slate-100">
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-slate-400" />
              <p className="text-sm font-medium text-slate-500">Carregando...</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-sm font-medium text-slate-600">{statusMsg}</p>

        {!connected && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleGenerateQrCode}
              disabled={isLoading || !instanceId}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Atualizar QR Code
            </button>
            <button
              type="button"
              onClick={handleForceNewInstance}
              disabled={isLoading}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Nova instância
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        Gateway: <span className="font-mono">{BIXS_API_ROUTES.instances}</span>
      </div>
    </div>
  );
}
