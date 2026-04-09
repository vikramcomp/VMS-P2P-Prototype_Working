/**
 * Mock Storage Utility for Prototype
 * Manages local persistence for standalone functional validation
 */

const STORAGE_KEY_PREFIX = 'vms_prototype_';

export const mockStorage = {
  get: <T>(key: string): T[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    return data ? JSON.parse(data) : [];
  },

  getAll: <T>(key: string): T[] => {
    return mockStorage.get<T>(key);
  },

  save: <T extends { id?: string | number }>(key: string, item: T): T => {
    if (typeof window === 'undefined') return item;
    const current = mockStorage.get<T>(key);
    
    // Auto-generate ID if missing
    const newItem = {
      ...item,
      id: item.id || `mock-${key}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const next = [...current, newItem];
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(next));
    return newItem;
  },

  update: <T extends { id: string | number }>(key: string, id: string | number, updates: Partial<T>): T | null => {
    if (typeof window === 'undefined') return null;
    const current = mockStorage.get<T>(key);
    const index = current.findIndex(item => String(item.id) === String(id));
    
    if (index === -1) return null;

    const updatedItem = { ...current[index], ...updates };
    current[index] = updatedItem;
    
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(current));
    return updatedItem;
  },

  delete: (key: string, id: string | number): void => {
    if (typeof window === 'undefined') return;
    const current = mockStorage.get(key);
    const next = current.filter((item: any) => String(item.id) !== String(id));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(next));
  },

  clear: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`);
  }
};

export default mockStorage;
