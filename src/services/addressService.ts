import type { LocationPoint } from '../types';

const ADDRESS_STORAGE_KEY = 'calc_distancia_user_addresses';

export interface SavedAddress extends LocationPoint {
  id: string;
  isDefault: boolean;
  name: string; // Ex: 'Casa', 'Trabalho'
}

export const getSavedAddresses = (userId: string): SavedAddress[] => {
  try {
    const data = localStorage.getItem(`${ADDRESS_STORAGE_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse saved addresses', e);
    return [];
  }
};

export const saveAddress = (userId: string, address: Omit<SavedAddress, 'id'>) => {
  const current = getSavedAddresses(userId);
  
  if (address.isDefault) {
    current.forEach(a => (a.isDefault = false));
  }

  const newAddress: SavedAddress = {
    ...address,
    id: Math.random().toString(36).substr(2, 9),
  };

  // If it's the first address, make it default automatically
  if (current.length === 0) {
    newAddress.isDefault = true;
  }

  current.push(newAddress);
  localStorage.setItem(`${ADDRESS_STORAGE_KEY}_${userId}`, JSON.stringify(current));
  return current;
};

export const removeAddress = (userId: string, addressId: string) => {
  let current = getSavedAddresses(userId);
  current = current.filter(a => a.id !== addressId);

  // Se removeu o default, tenta promover o primeiro
  if (current.length > 0 && !current.some(a => a.isDefault)) {
    current[0].isDefault = true;
  }

  localStorage.setItem(`${ADDRESS_STORAGE_KEY}_${userId}`, JSON.stringify(current));
  return current;
};

export const setDefaultAddress = (userId: string, addressId: string) => {
  const current = getSavedAddresses(userId);
  current.forEach(a => {
    a.isDefault = a.id === addressId;
  });
  localStorage.setItem(`${ADDRESS_STORAGE_KEY}_${userId}`, JSON.stringify(current));
  return current;
};
