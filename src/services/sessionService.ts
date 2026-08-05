import type { UserRole } from '../context/AuthContext';

const SESSION_KEY = 'calc_distancia_session';

export interface StoredAuthSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

const MOTOBOY_ID_BY_EMAIL: Record<string, string> = {
  'motoboy@exemplo.com': 'mb-001',
  'marcos@exemplo.com': 'mb-002',
  'ana@exemplo.com': 'mb-003',
  'ricardo@exemplo.com': 'mb-004',
  'felipe@exemplo.com': 'mb-005',
  'carla@exemplo.com': 'mb-006',
  'lucas@exemplo.com': 'mb-007',
  'beatriz@exemplo.com': 'mb-008',
  'thiago@exemplo.com': 'mb-009',
  'juliana@exemplo.com': 'mb-010',
  'rafael@exemplo.com': 'mb-011',
  'patricia@exemplo.com': 'mb-012',
};

/** Migra sessões antigas que usavam CLIENTE para o papel de estabelecimento. */
function migrateLegacySession(session: StoredAuthSession): StoredAuthSession {
  if (session.role === 'CLIENTE' && session.id.startsWith('client-')) {
    return { ...session, role: 'ESTABELECIMENTO' };
  }
  return session;
}

export function buildStableUserId(role: UserRole, email: string): string {
  const normalizedEmail = email.toLowerCase().trim();

  if (role === 'ADMIN') {
    return 'admin';
  }

  if (role === 'MOTOBOY') {
    return MOTOBOY_ID_BY_EMAIL[normalizedEmail] ?? 'mb-001';
  }

  if (role === 'ESTABELECIMENTO') {
    return `estabelecimento-${normalizedEmail.replace(/[^a-z0-9]/g, '-')}`;
  }

  if (role === 'CLIENTE') {
    return `consumidor-${normalizedEmail.replace(/[^a-z0-9]/g, '-')}`;
  }

  if (role === 'CONDOMINIO') {
    return `condominio-${normalizedEmail.replace(/[^a-z0-9]/g, '-')}`;
  }

  return `user-${normalizedEmail.replace(/[^a-z0-9]/g, '-')}`;
}

export function loadAuthSession(): StoredAuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return migrateLegacySession(JSON.parse(raw) as StoredAuthSession);
  } catch {
    return null;
  }
}

export function saveAuthSession(session: StoredAuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function createAuthSession(role: UserRole, email: string): StoredAuthSession {
  const normalizedEmail = email.toLowerCase().trim();
  const motoboyProfileNames: Record<string, string> = {
    'motoboy@exemplo.com': 'João Pedro',
    'marcos@exemplo.com': 'Marcos Silva',
    'ana@exemplo.com': 'Ana Costa',
    'ricardo@exemplo.com': 'Ricardo Lima',
    'felipe@exemplo.com': 'Felipe Souza',
    'carla@exemplo.com': 'Carla Mendes',
    'lucas@exemplo.com': 'Lucas Oliveira',
    'beatriz@exemplo.com': 'Beatriz Santos',
    'thiago@exemplo.com': 'Thiago Alves',
    'juliana@exemplo.com': 'Juliana Rocha',
    'rafael@exemplo.com': 'Rafael Gomes',
    'patricia@exemplo.com': 'Patrícia Nunes',
  };

  const roleLabels: Record<UserRole, string> = {
    ADMIN: 'Administrador',
    MOTOBOY: motoboyProfileNames[normalizedEmail] ?? normalizedEmail.split('@')[0] ?? 'Motoboy',
    ESTABELECIMENTO: normalizedEmail.split('@')[0] || 'Estabelecimento',
    CLIENTE: normalizedEmail.split('@')[0] || 'Cliente',
    CONDOMINIO: normalizedEmail.split('@')[0] || 'Condomínio',
  };

  return {
    id: buildStableUserId(role, normalizedEmail),
    name: roleLabels[role],
    email: normalizedEmail,
    role,
  };
}
