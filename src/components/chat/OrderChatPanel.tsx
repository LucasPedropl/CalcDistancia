import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { OrderChatMessage, OrderChatSenderRole } from '../../services/orderChatService';
import type { ThemeMode } from '../../types';
import { Send } from 'lucide-react';

interface OrderChatPanelProps {
  orderId: string;
  messages: OrderChatMessage[];
  currentUserId: string;
  currentUserRole: OrderChatSenderRole;
  otherPartyName: string;
  onSend: (text: string) => Promise<boolean>;
  onClose: () => void;
  theme?: ThemeMode;
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function OrderChatPanel({
  orderId,
  messages,
  currentUserId,
  currentUserRole,
  otherPartyName,
  onSend,
  onClose,
  theme = 'light',
}: OrderChatPanelProps) {
  const isDark = theme === 'dark';
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || isSending) return;

    const text = draft;
    setDraft('');
    setIsSending(true);
    const ok = await onSend(text);
    if (!ok) setDraft(text);
    setIsSending(false);
  };

  return (
    <div
      className={`flex h-[min(28rem,70vh)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border shadow-2xl ${
        isDark ? 'border-zinc-700 bg-zinc-950 text-white' : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${
          isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div>
          <p className="text-sm font-bold">Chat do pedido</p>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            {otherPartyName} · {orderId}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`rounded-lg px-2 py-1 text-xs font-semibold ${
            isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Fechar
        </button>
      </div>

      <div className={`flex-1 space-y-3 overflow-y-auto p-4 ${isDark ? 'bg-zinc-950' : 'bg-slate-50/80'}`}>
        {messages.length === 0 ? (
          <p className={`text-center text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            Nenhuma mensagem ainda. Inicie a conversa sobre a entrega.
          </p>
        ) : (
          messages.map((message) => {
            const isMine =
              message.senderId === currentUserId && message.senderRole === currentUserRole;

            return (
              <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    isMine
                      ? 'rounded-br-none bg-slate-900 text-white'
                      : isDark
                        ? 'rounded-bl-none border border-zinc-800 bg-zinc-900 text-zinc-100'
                        : 'rounded-bl-none border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {!isMine && (
                    <p className={`mb-0.5 text-[10px] font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {message.senderName}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  <p
                    className={`mt-1 text-right text-[10px] ${
                      isMine ? 'text-white/60' : isDark ? 'text-zinc-500' : 'text-slate-400'
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className={`flex shrink-0 gap-2 border-t p-3 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'}`}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={isSending}
          className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none ${
            isDark
              ? 'border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500 focus:border-zinc-500'
              : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-900'
          }`}
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim()}
          className="flex shrink-0 items-center justify-center rounded-xl bg-slate-900 p-2.5 text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          title="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
