import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import type { OrderChatSenderRole } from '../../services/orderChatService';
import type { ThemeMode } from '../../types';
import { useOrderChat } from '../../hooks/useOrderChat';
import { OrderChatPanel } from './OrderChatPanel';

interface OrderChatWidgetProps {
  orderId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: OrderChatSenderRole;
  otherPartyName: string;
  theme?: ThemeMode;
}

export function OrderChatWidget({
  orderId,
  currentUserId,
  currentUserName,
  currentUserRole,
  otherPartyName,
  theme = 'light',
}: OrderChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage } = useOrderChat(orderId);

  const handleSend = async (text: string) => {
    return sendMessage(text, {
      id: currentUserId,
      name: currentUserName,
      role: currentUserRole,
    });
  };

  return (
    <div className="safe-bottom fixed bottom-4 right-4 z-[1100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <OrderChatPanel
          orderId={orderId}
          messages={messages}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          otherPartyName={otherPartyName}
          onSend={handleSend}
          onClose={() => setIsOpen(false)}
          theme={theme}
        />
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl shadow-slate-900/30 transition-transform hover:scale-105 active:scale-95"
        title={isOpen ? 'Fechar chat' : 'Abrir chat do pedido'}
        aria-label={isOpen ? 'Fechar chat do pedido' : 'Abrir chat do pedido'}
        aria-expanded={isOpen}
      >
        <MessageCircle className="h-6 w-6" />
        {!isOpen && messages.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
            {messages.length > 9 ? '9+' : messages.length}
          </span>
        )}
      </button>
    </div>
  );
}
