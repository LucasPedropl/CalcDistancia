export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  const ddd = parseInt(cleanPhone.substring(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;

  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') return false;

  if (/^(\d)\1+$/.test(cleanPhone)) return false;

  return true;
}

export function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function normalizePhoneToE164(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
}

export function resolvePhoneForEnvironment(phone: string): string {
  const e164 = normalizePhoneToE164(phone);

  if (import.meta.env.DEV) {
    const testPhone = import.meta.env.VITE_BIXS_TEST_PHONE ?? '31972532104';
    return normalizePhoneToE164(testPhone);
  }

  return e164;
}
