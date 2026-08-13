import type { LocationPoint } from '../types';
import { extractStreetLine, normalizeAddressToken, normalizeCepDigits } from './addressNormalization';

function streetsLikelyMatch(destination: LocationPoint, condoAddress: LocationPoint): boolean {
  const destStreet = normalizeAddressToken(extractStreetLine(destination.address));
  const condoStreet = normalizeAddressToken(extractStreetLine(condoAddress.address));

  if (destStreet.length < 5 || condoStreet.length < 5) return false;

  return destStreet.includes(condoStreet) || condoStreet.includes(destStreet);
}

/**
 * Heurística complementar ao raio de 500 m: mesmo CEP com rua ou bairro
 * equivalente também caracteriza o mesmo empreendimento.
 */
export function addressesLikelySameArea(
  destination: LocationPoint,
  condoAddress: LocationPoint,
): boolean {
  const destCep = normalizeCepDigits(destination.cep);
  const condoCep = normalizeCepDigits(condoAddress.cep);

  if (destCep.length === 8 && condoCep.length === 8 && destCep === condoCep) {
    if (streetsLikelyMatch(destination, condoAddress)) return true;

    const destDistrict = normalizeAddressToken(destination.district ?? '');
    const condoDistrict = normalizeAddressToken(condoAddress.district ?? '');
    if (destDistrict && condoDistrict && destDistrict === condoDistrict) return true;
  }

  return streetsLikelyMatch(destination, condoAddress);
}
