import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import type { ThemeMode } from '../../../types';
import type { OrderChatSenderRole } from '../../../services/orderChatService';
import { useOrderChat } from '../../../hooks/useOrderChat';
import { OrderChatPanel } from '../../../components/chat/OrderChatPanel';

interface ClienteOrderChatWidgetProps {
  orderId: string;
  currentUserId: string;
  currentUserName: string;
  motoboyName?: string;
  establishmentName: string;
  theme?: ThemeMode;
}

type ChatTarget = 'motoboy' | 'establishment';

export function ClienteOrderChatWidget({
  orderId,
  currentUserId,
  currentUserName,
  motoboyName,
  establishmentName,
  theme = 'light',
}: ClienteOrderChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<ChatTarget>('motoboy');
  const { messages, sendMessage } = useOrderChat(orderId);

  const currentUserRole: OrderChatSenderRole = 'CLIENT';
  const otherPartyName = target === 'motoboy' ? motoboyName ?? 'Motoboy' : establishmentName;

  const handleSend = async (text: string) => {
    const prefix = target === 'motoboy' ? '[Motoboy] ' : '[Estabelecimento] ';
    return sendMessage(`${prefix}${text}`, {
      id: currentUserId,
      name: currentUserName,
      role: currentUserRole,
    });
  };

  const filteredMessages = messages.filter((message) => {
    if (message.senderRole === 'CLIENT') return true;
    if (target === 'motoboy') {
      return message.senderRole === 'MOTOBOY' || message.text.startsWith('[Motoboy]');
    }
    return message.senderRole === 'ESTABLISHMENT' || message.text.startsWith('[Estabelecimento]');
  });

  return (
    <div className="safe-bottom fixed bottom-4 right-4 z-[1100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            <button
              type="button"
              onClick={() => setTarget('motoboy')}
              disabled={!motoboyName}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                target === 'motoboy'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40'
              }`}
            >
              Motoboy
            </button>
            <button
              type="button"
              onClick={() => setTarget('establishment')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                target === 'establishment'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Estabelecimento
            </button>
          </div>
          <OrderChatPanel
            orderId={orderId}
            messages={filteredMessages}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            otherPartyName={otherPartyName}
            onSend={handleSend}
            onClose={() => setIsOpen(false)}
            theme={theme}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
        title="Abrir chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
