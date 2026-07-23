const SESSION_KEY = 'calc_distancia_session';

export type AuthRole = 'admin' | 'user';

export interface AuthSession {
  username: string;
  role: AuthRole;
  loggedInAt: string;
}

/** Credenciais padrão (demo). Admin pode alterar tabela de preços. */
const DEFAULT_CREDENTIALS: Record<string, { password: string; role: AuthRole }> = {
  admin: { password: 'admin', role: 'admin' },
  usuario: { password: 'usuario', role: 'user' },
};

export function authenticateUser(username: string, password: string): AuthSession | null {
  const normalizedUsername = username.trim().toLowerCase();
  const entry = DEFAULT_CREDENTIALS[normalizedUsername];
  if (!entry || entry.password !== password) {
    return null;
  }
  const session: AuthSession = {
    username: normalizedUsername,
    role: entry.role,
    loggedInAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to persist auth session', e);
  }
  return session;
}

export function loadAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.username || !parsed.role) return null;
    return parsed;
  } catch (e) {
    console.error('Failed to load auth session', e);
    return null;
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear auth session', e);
  }
}

export function isAdminSession(session: AuthSession | null): boolean {
  return session?.role === 'admin';
}
