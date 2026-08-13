export interface LocalCollectionStore<TEntity> {
  readAll(): TEntity[];
  writeAll(entities: TEntity[]): void;
  subscribe(listener: () => void): () => void;
  notify(): void;
}

/**
 * Coleção simples persistida em localStorage com notificação entre abas
 * (evento `storage`) e dentro da mesma aba (CustomEvent), no mesmo padrão do
 * orderService. `writeAll` propaga QuotaExceededError para o chamador tratar.
 */
export function createLocalCollectionStore<TEntity>(
  storageKey: string,
): LocalCollectionStore<TEntity> {
  const updateEventName = `${storageKey}-updated`;

  const notify = () => {
    window.dispatchEvent(new CustomEvent(updateEventName));
  };

  return {
    readAll(): TEntity[] {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as TEntity[];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },

    writeAll(entities: TEntity[]): void {
      localStorage.setItem(storageKey, JSON.stringify(entities));
      notify();
    },

    subscribe(listener: () => void): () => void {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === storageKey) listener();
      };
      const handleCustom = () => listener();

      window.addEventListener('storage', handleStorage);
      window.addEventListener(updateEventName, handleCustom);

      return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(updateEventName, handleCustom);
      };
    },

    notify,
  };
}

export function generateEntityId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${random}`;
}
