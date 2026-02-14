// Backend API configuration
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3004';

// App configuration
export const APP_NAME = 'AI Kiosk';
export const IDLE_TIMEOUT = 60; // seconds

// Storage keys
export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  LICENSE_KEY: 'license_key',
  STORE_DATA: 'store_data',
} as const;
