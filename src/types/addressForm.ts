export interface AddressFormFields {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export const EMPTY_ADDRESS_FORM: AddressFormFields = {
  cep: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
};

export const BRAZILIAN_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
] as const;

/** Converte nome completo do estado (Nominatim) ou sigla para UF de 2 letras. */
export function normalizeBrazilianStateToUf(state: string): string {
  const trimmed = state.trim();
  if (!trimmed) return '';

  const upper = trimmed.toUpperCase();
  if (upper.length === 2 && BRAZILIAN_STATES.some(({ uf }) => uf === upper)) {
    return upper;
  }

  const normalizeText = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const normalizedInput = normalizeText(trimmed);
  const match = BRAZILIAN_STATES.find(
    ({ name }) => normalizeText(name) === normalizedInput,
  );

  return match?.uf ?? '';
}

export function isStreetNumberOptionalValue(number: string): boolean {
  const normalized = number
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  return (
    normalized.length === 0 ||
    normalized === 's/n' ||
    normalized === 'sn' ||
    normalized === 'sem numero' ||
    normalized === '-' ||
    normalized === '0'
  );
}

export function isAddressFormValid(
  fields: AddressFormFields,
  options?: { numberRequired?: boolean },
): boolean {
  const cepDigits = fields.cep.replace(/\D/g, '');
  const numberRequired = options?.numberRequired ?? true;
  const numberOk = numberRequired
    ? fields.number.trim().length > 0
    : true;

  return (
    cepDigits.length === 8 &&
    fields.street.trim().length > 0 &&
    numberOk &&
    fields.district.trim().length > 0 &&
    fields.city.trim().length > 0 &&
    fields.state.trim().length === 2
  );
}
