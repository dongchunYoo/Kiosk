import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

// Fallback in-memory store when AsyncStorage native module is not available.
const memoryStore = new Map<string, string>();

function hasAsyncStorage(): boolean {
  return !!(AsyncStorage && typeof AsyncStorage.getItem === 'function');
}

async function safeGetItem(key: string): Promise<string | null> {
  if (hasAsyncStorage()) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      // Fall through to memory fallback
    }
  }
  return memoryStore.get(key) ?? null;
}

async function safeSetItem(key: string, value: string): Promise<void> {
  if (hasAsyncStorage()) {
    try {
      await AsyncStorage.setItem(key, value);
      return;
    } catch (e) {
      // Fall back to memory store
    }
  }
  memoryStore.set(key, value);
}

async function safeRemoveItem(key: string): Promise<void> {
  if (hasAsyncStorage()) {
    try {
      await AsyncStorage.removeItem(key);
      return;
    } catch (e) {
      // Fall back
    }
  }
  memoryStore.delete(key);
}

async function safeMultiRemove(keys: string[]): Promise<void> {
  if (hasAsyncStorage()) {
    try {
      await AsyncStorage.multiRemove(keys);
      return;
    } catch (e) {
      // Fall back
    }
  }
  for (const k of keys) memoryStore.delete(k);
}

export const storage = {
  // JWT Token
  async getToken(): Promise<string | null> {
    return await safeGetItem(STORAGE_KEYS.JWT_TOKEN);
  },

  async setToken(token: string): Promise<void> {
    await safeSetItem(STORAGE_KEYS.JWT_TOKEN, token);
  },

  async removeToken(): Promise<void> {
    await safeRemoveItem(STORAGE_KEYS.JWT_TOKEN);
  },

  // License Key
  async getLicenseKey(): Promise<string | null> {
    return await safeGetItem(STORAGE_KEYS.LICENSE_KEY);
  },

  async setLicenseKey(key: string): Promise<void> {
    await safeSetItem(STORAGE_KEYS.LICENSE_KEY, key);
  },

  async removeLicenseKey(): Promise<void> {
    await safeRemoveItem(STORAGE_KEYS.LICENSE_KEY);
  },

  // Store Data
  async getStoreData(): Promise<string | null> {
    return await safeGetItem(STORAGE_KEYS.STORE_DATA);
  },

  async setStoreData(data: string): Promise<void> {
    await safeSetItem(STORAGE_KEYS.STORE_DATA, data);
  },

  async removeStoreData(): Promise<void> {
    await safeRemoveItem(STORAGE_KEYS.STORE_DATA);
  },

  // Clear all
  async clearAll(): Promise<void> {
    await safeMultiRemove([
      STORAGE_KEYS.JWT_TOKEN,
      STORAGE_KEYS.LICENSE_KEY,
      STORAGE_KEYS.STORE_DATA,
    ]);
  },
};
