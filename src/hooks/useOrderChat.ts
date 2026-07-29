import { useCallback, useEffect, useState } from 'react';
import type { OrderChatMessage, OrderChatSenderRole } from '../services/orderChatService';
import {
  getOrderChatMessages,
  sendOrderChatMessage,
  subscribeToOrderChat,
} from '../services/orderChatService';

export function useOrderChat(orderId: string | null) {
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);

  const refresh = useCallback(() => {
    if (!orderId) {
      setMessages([]);
      return;
    }
    setMessages(getOrderChatMessages(orderId));
  }, [orderId]);

  useEffect(() => {
    refresh();
    if (!orderId) return undefined;
    return subscribeToOrderChat(orderId, refresh);
  }, [orderId, refresh]);

  const sendMessage = useCallback(
    async (
      text: string,
      sender: { id: string; name: string; role: OrderChatSenderRole },
    ): Promise<boolean> => {
      if (!orderId || !text.trim()) return false;
      try {
        sendOrderChatMessage({
          orderId,
          senderId: sender.id,
          senderRole: sender.role,
          senderName: sender.name,
          text,
        });
        refresh();
        return true;
      } catch (error) {
        console.error('Falha ao enviar mensagem do chat', error);
        return false;
      }
    },
    [orderId, refresh],
  );

  return { messages, sendMessage };
}
