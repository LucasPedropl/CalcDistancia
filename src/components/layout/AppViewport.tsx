import type { ReactNode } from 'react';
import type { ThemeMode } from '../../types';

interface AppViewportProps {
  children: ReactNode;
  theme?: ThemeMode;
  className?: string;
}

/** Full-height app shell — use instead of h-screen w-screen to avoid mobile overflow. */
export function AppViewport({ children, theme = 'light', className = '' }: AppViewportProps) {
  const isDark = theme === 'dark';

  return (
    <div
      className={`flex h-dvh w-full max-w-[100vw] flex-col overflow-hidden font-sans transition-colors ${
        isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      } ${className}`}
    >
      {children}
    </div>
  );
}
