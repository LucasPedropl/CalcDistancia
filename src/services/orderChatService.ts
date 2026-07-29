export type OrderChatSenderRole = 'CLIENT' | 'MOTOBOY';

export interface OrderChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderRole: OrderChatSenderRole;
  senderName: string;
  text: string;
  createdAt: string;
}

const CHAT_STORAGE_PREFIX = 'calc_distancia_order_chat_';
const CHAT_UPDATED_EVENT = 'calc-distancia-chat-updated';

function getChatStorageKey(orderId: string): string {
  return `${CHAT_STORAGE_PREFIX}${orderId}`;
}

function loadMessages(orderId: string): OrderChatMessage[] {
  try {
    const raw = localStorage.getItem(getChatStorageKey(orderId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OrderChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages(orderId: string, messages: OrderChatMessage[]): void {
  localStorage.setItem(getChatStorageKey(orderId), JSON.stringify(messages));
  window.dispatchEvent(
    new CustomEvent(CHAT_UPDATED_EVENT, { detail: { orderId } }),
  );
}

export function getOrderChatMessages(orderId: string): OrderChatMessage[] {
  return loadMessages(orderId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function sendOrderChatMessage(input: {
  orderId: string;
  senderId: string;
  senderRole: OrderChatSenderRole;
  senderName: string;
  text: string;
}): OrderChatMessage {
  const trimmed = input.text.trim();
  if (!trimmed) {
    throw new Error('Mensagem vazia');
  }

  const message: OrderChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    orderId: input.orderId,
    senderId: input.senderId,
    senderRole: input.senderRole,
    senderName: input.senderName,
    text: trimmed,
    createdAt: new Date().toISOString(),
  };

  const messages = loadMessages(input.orderId);
  messages.push(message);
  saveMessages(input.orderId, messages);
  return message;
}

export function subscribeToOrderChat(
  orderId: string,
  callback: () => void,
): () => void {
  const handleCustom = (event: Event) => {
    const detail = (event as CustomEvent<{ orderId?: string }>).detail;
    if (!detail?.orderId || detail.orderId === orderId) {
      callback();
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === getChatStorageKey(orderId)) {
      callback();
    }
  };

  window.addEventListener(CHAT_UPDATED_EVENT, handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(CHAT_UPDATED_EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}
