/** Validação superficial de cartão para o checkout simulado — não faz Luhn nem tokenização. */
export function validateCardFields(number: string, expiry: string, cvv: string): string | null {
  if (number.replace(/\D/g, '').length < 13) return 'Informe um número de cartão válido.';
  if (!/^\d{2}\/\d{2}$/.test(expiry.trim())) return 'Validade no formato MM/AA.';
  if (cvv.replace(/\D/g, '').length < 3) return 'CVV inválido.';
  return null;
}
