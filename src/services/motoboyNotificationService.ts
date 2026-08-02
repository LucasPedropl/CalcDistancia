import { DEMO_MOTOBOY_IDS } from './motoboyService';

export interface MotoboyNotification {
  id: string;
  motoboyId: string;
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

const NOTIFICATIONS_KEY = 'calc_distancia_motoboy_notifications';
const NOTIFICATIONS_EVENT = 'calc-distancia-motoboy-notifications';

function loadNotifications(): MotoboyNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MotoboyNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: MotoboyNotification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT));
}

export function pushMotoboyNotification(input: {
  motoboyId: string;
  title: string;
  message: string;
  orderId?: string;
}): MotoboyNotification {
  const notification: MotoboyNotification = {
    id: `notif-${Date.now()}`,
    motoboyId: input.motoboyId,
    title: input.title,
    message: input.message,
    orderId: input.orderId,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const all = loadNotifications();
  all.unshift(notification);
  saveNotifications(all.slice(0, 100));
  return notification;
}

export function pushBroadcastMotoboyNotification(input: {
  title: string;
  message: string;
  orderId?: string;
}): void {
  DEMO_MOTOBOY_IDS.forEach((motoboyId) => {
    pushMotoboyNotification({ motoboyId, ...input });
  });
}

export function getUnreadNotificationsForMotoboy(motoboyId: string): MotoboyNotification[] {
  return loadNotifications().filter((n) => n.motoboyId === motoboyId && !n.read);
}

export function markNotificationsRead(motoboyId: string): void {
  const updated = loadNotifications().map((n) =>
    n.motoboyId === motoboyId ? { ...n, read: true } : n,
  );
  saveNotifications(updated);
}

export function subscribeToMotoboyNotifications(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(NOTIFICATIONS_EVENT, handler);
  window.addEventListener('storage', (e) => {
    if (e.key === NOTIFICATIONS_KEY) callback();
  });
  return () => window.removeEventListener(NOTIFICATIONS_EVENT, handler);
}
