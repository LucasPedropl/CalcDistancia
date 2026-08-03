export const DEFAULT_MOTOBOY_RADIUS_KM = 15;

export interface MotoboyProfile {
  motoboyId: string;
  nome: string;
  telefone: string;
  email: string;
  placa: string;
  cidade: string;
  estado: string;
  veiculo: 'MOTO' | 'CARRO' | 'BIKE';
  publico: boolean;
  cpf: string;
  bairro: string;
  /** Raio máximo em km para aceitar corridas a partir da posição atual. */
  raioKm: number;
}

const PROFILE_KEY = 'calc_distancia_motoboy_profile';

function migrateLegacyMotoboyProfile(profile: MotoboyProfile): MotoboyProfile {
  const isLegacyBeloHorizonte =
    profile.estado === 'MG' ||
    profile.cidade.toLowerCase().includes('belo horizonte');

  if (!isLegacyBeloHorizonte) return profile;

  const demo = DEMO_MOTOBOY_PROFILES[profile.motoboyId];
  return {
    ...profile,
    cidade: demo?.cidade ?? 'São Mateus',
    estado: demo?.estado ?? 'ES',
    bairro: demo?.bairro ?? profile.bairro,
  };
}

/** Perfis demo pré-cadastrados (São Mateus, ES). Usados quando não há dados no localStorage. */
export const DEMO_MOTOBOY_PROFILES: Record<string, MotoboyProfile> = {
  'mb-001': {
    motoboyId: 'mb-001',
    nome: 'João Pedro',
    telefone: '(27) 99517-6920',
    email: 'motoboy@exemplo.com',
    placa: 'ABC1D23',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'MOTO',
    publico: true,
    cpf: '10293847561',
    bairro: 'Centro',
    raioKm: 15,
  },
  'mb-002': {
    motoboyId: 'mb-002',
    nome: 'Marcos Silva',
    telefone: '(27) 99812-3456',
    email: 'marcos@exemplo.com',
    placa: 'DEF2G45',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'MOTO',
    publico: true,
    cpf: '20384756192',
    bairro: 'Guriri',
    raioKm: 12,
  },
  'mb-003': {
    motoboyId: 'mb-003',
    nome: 'Ana Costa',
    telefone: '(27) 99765-4321',
    email: 'ana@exemplo.com',
    placa: 'GHI3H67',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'CARRO',
    publico: true,
    cpf: '30475619283',
    bairro: 'Boa Vista',
    raioKm: 20,
  },
  'mb-004': {
    motoboyId: 'mb-004',
    nome: 'Ricardo Lima',
    telefone: '(27) 99654-3210',
    email: 'ricardo@exemplo.com',
    placa: 'JKL4J89',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'MOTO',
    publico: true,
    cpf: '40567192834',
    bairro: 'Ilha dos Araújos',
    raioKm: 10,
  },
  'mb-005': {
    motoboyId: 'mb-005',
    nome: 'Felipe Souza',
    telefone: '(27) 99543-2109',
    email: 'felipe@exemplo.com',
    placa: 'MNO5K12',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'MOTO',
    publico: true,
    cpf: '50671928345',
    bairro: 'Sernamby',
    raioKm: 8,
  },
  'mb-006': {
    motoboyId: 'mb-006',
    nome: 'Carla Mendes',
    telefone: '(27) 99432-1098',
    email: 'carla@exemplo.com',
    placa: 'PQR6L34',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'MOTO',
    publico: true,
    cpf: '60719283456',
    bairro: 'Laranja da Terra',
    raioKm: 15,
  },
  'mb-007': {
    motoboyId: 'mb-007',
    nome: 'Lucas Oliveira',
    telefone: '(27) 99321-0987',
    email: 'lucas@exemplo.com',
    placa: 'STU7M56',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'MOTO',
    publico: true,
    cpf: '70819234567',
    bairro: 'Guriri Norte',
    raioKm: 18,
  },
  'mb-008': {
    motoboyId: 'mb-008',
    nome: 'Beatriz Santos',
    telefone: '(27) 99210-9876',
    email: 'beatriz@exemplo.com',
    placa: 'VWX8N78',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'MOTO',
    publico: true,
    cpf: '80921345678',
    bairro: 'Guriri Sul',
    raioKm: 14,
  },
  'mb-009': {
    motoboyId: 'mb-009',
    nome: 'Thiago Alves',
    telefone: '(27) 99109-8765',
    email: 'thiago@exemplo.com',
    placa: 'YZA9P90',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'MOTO',
    publico: true,
    cpf: '91032456789',
    bairro: 'Centro',
    raioKm: 12,
  },
  'mb-010': {
    motoboyId: 'mb-010',
    nome: 'Juliana Rocha',
    telefone: '(27) 99098-7654',
    email: 'juliana@exemplo.com',
    placa: 'BCD0Q12',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'CARRO',
    publico: true,
    cpf: '02143567890',
    bairro: 'Sernamby',
    raioKm: 20,
  },
  'mb-011': {
    motoboyId: 'mb-011',
    nome: 'Rafael Gomes',
    telefone: '(27) 98987-6543',
    email: 'rafael@exemplo.com',
    placa: 'EFG1R34',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'MOTO',
    publico: true,
    cpf: '13254678901',
    bairro: 'Guriri',
    raioKm: 16,
  },
  'mb-012': {
    motoboyId: 'mb-012',
    nome: 'Patrícia Nunes',
    telefone: '(27) 98876-5432',
    email: 'patricia@exemplo.com',
    placa: 'HIJ2S56',
    cidade: 'São Mateus',
    estado: 'ES',
    veiculo: 'MOTO',
    publico: true,
    cpf: '24365789012',
    bairro: 'Boa Vista',
    raioKm: 11,
  },
};

export function loadMotoboyProfile(motoboyId: string): MotoboyProfile | null {
  try {
    const raw = localStorage.getItem(`${PROFILE_KEY}_${motoboyId}`);
    if (raw) {
      const stored = JSON.parse(raw) as MotoboyProfile;
      const migrated = migrateLegacyMotoboyProfile(stored);
      const profile = {
        ...migrated,
        raioKm: migrated.raioKm ?? DEFAULT_MOTOBOY_RADIUS_KM,
      };

      if (
        profile.cidade !== stored.cidade ||
        profile.estado !== stored.estado ||
        profile.bairro !== stored.bairro
      ) {
        saveMotoboyProfile(profile);
      }

      return profile;
    }
  } catch {
    // fallback para perfil demo
  }

  return DEMO_MOTOBOY_PROFILES[motoboyId] ?? null;
}

export function saveMotoboyProfile(profile: MotoboyProfile): MotoboyProfile {
  localStorage.setItem(`${PROFILE_KEY}_${profile.motoboyId}`, JSON.stringify(profile));
  return profile;
}

export function getDefaultMotoboyProfile(
  motoboyId: string,
  fallbackName: string,
  fallbackEmail: string
): MotoboyProfile {
  const demo = DEMO_MOTOBOY_PROFILES[motoboyId];
  if (demo) return { ...demo };

  return (
    loadMotoboyProfile(motoboyId) ?? {
      motoboyId,
      nome: fallbackName,
      telefone: '',
      email: fallbackEmail,
      placa: '',
      cidade: 'São Mateus',
      estado: 'ES',
      veiculo: 'MOTO',
      publico: true,
      cpf: '',
      bairro: '',
      raioKm: DEFAULT_MOTOBOY_RADIUS_KM,
    }
  );
}
