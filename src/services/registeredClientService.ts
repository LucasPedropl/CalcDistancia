import { buildStableUserId } from './sessionService';
import { loadClientProfile } from './clientProfileService';
import type { LocationPoint } from '../types';

const REGISTRY_KEY = 'calc_distancia_registered_clients';

export interface RegisteredClient {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  homeAddress?: LocationPoint | null;
}

const DEFAULT_REGISTERED_CLIENTS: RegisteredClient[] = [
  {
    userId: buildStableUserId('CLIENTE', 'cliente@exemplo.com'),
    name: 'Cliente',
    email: 'cliente@exemplo.com',
    phone: '(27) 99999-0001',
  },
];

function loadRegistry(): RegisteredClient[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RegisteredClient[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRegistry(clients: RegisteredClient[]): void {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(clients));
}

export function registerClientAccount(client: Omit<RegisteredClient, 'homeAddress'>): void {
  const registry = loadRegistry();
  const index = registry.findIndex((entry) => entry.userId === client.userId);

  const merged: RegisteredClient = {
    ...client,
    homeAddress: loadClientProfile(client.userId).homeAddress,
  };

  if (index === -1) {
    registry.push(merged);
  } else {
    registry[index] = { ...registry[index], ...merged };
  }

  saveRegistry(registry);
}

export function listRegisteredClients(): RegisteredClient[] {
  const byId = new Map<string, RegisteredClient>();

  for (const client of DEFAULT_REGISTERED_CLIENTS) {
    byId.set(client.userId, { ...client });
  }

  for (const client of loadRegistry()) {
    byId.set(client.userId, { ...byId.get(client.userId), ...client });
  }

  return Array.from(byId.values())
    .map((client) => {
      const profile = loadClientProfile(client.userId);
      return {
        ...client,
        phone: client.phone || profile.phone || undefined,
        homeAddress: profile.homeAddress ?? client.homeAddress ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function getRegisteredClientById(userId: string): RegisteredClient | undefined {
  return listRegisteredClients().find((client) => client.userId === userId);
}

export function createQuickRegisteredClient(input: {
  name: string;
  email: string;
  phone?: string;
}): RegisteredClient {
  const normalizedEmail = input.email.toLowerCase().trim();
  const userId = buildStableUserId('CLIENTE', normalizedEmail);

  const existing = getRegisteredClientById(userId);
  if (existing) {
    throw new Error('Já existe um cliente cadastrado com este e-mail.');
  }

  registerClientAccount({
    userId,
    name: input.name.trim(),
    email: normalizedEmail,
    phone: input.phone?.trim() || undefined,
  });

  return getRegisteredClientById(userId)!;
}

