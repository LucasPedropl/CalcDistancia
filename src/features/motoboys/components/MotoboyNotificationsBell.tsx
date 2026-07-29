import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import {
  getUnreadNotificationsForMotoboy,
  markNotificationsRead,
  subscribeToMotoboyNotifications,
  type MotoboyNotification,
} from '../../../services/motoboyNotificationService';

interface MotoboyNotificationsBellProps {
  motoboyId: string;
}

export function MotoboyNotificationsBell({ motoboyId }: MotoboyNotificationsBellProps) {
  const [notifications, setNotifications] = useState<MotoboyNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const refresh = () => {
    setNotifications(getUnreadNotificationsForMotoboy(motoboyId));
  };

  useEffect(() => {
    refresh();
    return subscribeToMotoboyNotifications(refresh);
  }, [motoboyId]);

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      markNotificationsRead(motoboyId);
      setTimeout(refresh, 100);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
        title="Notificações"
      >
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl">
          <p className="mb-2 text-xs font-bold uppercase text-slate-500">Notificações</p>
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhuma notificação nova.</p>
          ) : (
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-lg bg-slate-50 p-2 text-xs">
                  <p className="font-bold text-slate-900">{notification.title}</p>
                  <p className="text-slate-600">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
