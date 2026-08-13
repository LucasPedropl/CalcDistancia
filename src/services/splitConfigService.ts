const SPLIT_CONFIG_KEY = 'calc_distancia_split_config';
const SPLIT_CONFIG_UPDATED_EVENT = 'calc-distancia-split-config-updated';

export interface SplitConfig {
  motoboyPercent: number;
  platformPercent: number;
}

export const DEFAULT_SPLIT_CONFIG: SplitConfig = {
  motoboyPercent: 80,
  platformPercent: 20,
};

export function loadSplitConfig(): SplitConfig {
  try {
    const raw = localStorage.getItem(SPLIT_CONFIG_KEY);
    if (!raw) return DEFAULT_SPLIT_CONFIG;

    const parsed = JSON.parse(raw) as Partial<SplitConfig>;
    const motoboyPercent = Number(parsed.motoboyPercent);
    if (!Number.isFinite(motoboyPercent)) return DEFAULT_SPLIT_CONFIG;

    const clamped = Math.min(100, Math.max(0, motoboyPercent));
    return { motoboyPercent: clamped, platformPercent: 100 - clamped };
  } catch {
    return DEFAULT_SPLIT_CONFIG;
  }
}

export function saveSplitConfig(motoboyPercent: number): SplitConfig {
  const clamped = Math.min(100, Math.max(0, Math.round(motoboyPercent)));
  const config: SplitConfig = { motoboyPercent: clamped, platformPercent: 100 - clamped };

  localStorage.setItem(SPLIT_CONFIG_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent(SPLIT_CONFIG_UPDATED_EVENT));
  return config;
}

export interface SplitBreakdown {
  totalCents: number;
  motoboyCents: number;
  platformCents: number;
}

/** Divide o valor mantendo a soma exata (a sobra de arredondamento vai ao motoboy). */
export function calculateSplit(totalCents: number, config = loadSplitConfig()): SplitBreakdown {
  const safeTotal = Math.max(0, Math.round(totalCents));
  const platformCents = Math.round((safeTotal * config.platformPercent) / 100);

  return {
    totalCents: safeTotal,
    platformCents,
    motoboyCents: safeTotal - platformCents,
  };
}

export function subscribeToSplitConfig(listener: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SPLIT_CONFIG_KEY) listener();
  };
  const handleCustom = () => listener();

  window.addEventListener('storage', handleStorage);
  window.addEventListener(SPLIT_CONFIG_UPDATED_EVENT, handleCustom);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(SPLIT_CONFIG_UPDATED_EVENT, handleCustom);
  };
}
