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
}

const PROFILE_KEY = 'calc_distancia_motoboy_profile';

export function loadMotoboyProfile(motoboyId: string): MotoboyProfile | null {
  try {
    const raw = localStorage.getItem(`${PROFILE_KEY}_${motoboyId}`);
    if (!raw) return null;
    return JSON.parse(raw) as MotoboyProfile;
  } catch {
    return null;
  }
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
  return (
    loadMotoboyProfile(motoboyId) ?? {
      motoboyId,
      nome: fallbackName,
      telefone: '',
      email: fallbackEmail,
      placa: '',
      cidade: 'Belo Horizonte',
      estado: 'MG',
      veiculo: 'MOTO',
      publico: true,
      cpf: '',
      bairro: '',
    }
  );
}
