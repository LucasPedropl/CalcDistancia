/** Normaliza CEP para comparação (apenas dígitos). */
export function normalizeCepDigits(cep?: string): string {
  return cep?.replace(/\D/g, '') ?? '';
}

/** Normaliza texto de endereço para comparação fuzzy. */
export function normalizeAddressToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(avenida|av|rua|r|alameda|al|travessa|tv)\b\.?/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

export function extractStreetLine(address: string): string {
  return address.split(',')[0]?.trim() ?? address;
}
