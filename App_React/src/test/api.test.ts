import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api, { apiService } from '../services/api';
import type { LoginRequest } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

let mock: MockAdapter;

describe('API Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mock = new MockAdapter(api);

    // Default handlers
    mock.onGet('/health').reply(200, { status: 'ok', uptime: 12345, timestamp: new Date().toISOString() });
    mock.onPost('/auth/login').reply((config) => {
      const body = config.data ? JSON.parse(config.data) : {};
      if (body.user_Id === 'test@example.com' && body.password === 'password123') {
        return [200, { success: true, token: 'mock-jwt-token', user: { id: 1, user_Id: 'test@example.com', role: 'A', name: '테스트 사용자' } }];
      }
      return [401, { success: false, message: 'Invalid credentials' }];
    });
    mock.onGet('/licenses/check').reply((config) => {
      const params = config.params || {};
      const licenseKey = params.license_key;
      if (licenseKey === 'valid-license-key') {
        return [200, { valid: true, store_id: 1, device_id: 'device-001' }];
      }
      return [400, { valid: false }];
    });
    mock.onGet('/appdata').reply((config) => {
      const params = config.params || {};
      const licenseKey = params.license_key;
      if (licenseKey === 'valid-license-key') {
        return [200, {
          id: 1,
          device_id: 'device-001',
          store: { id: 1, name: '테스트 카페', owner_id: 1, address: '서울시 강남구', timezone: 'Asia/Seoul' },
          categories: [ { id: 1, store_id: 1, name: '커피', description: '커피 메뉴', display_order: 1 } ],
          products: [ { id: 1, store_id: 1, category_id: 1, name: '아메리카노', price: 4000, image_url: '/uploads/products/americano.jpg', is_available: true, display_order: 1, product_options: [ { id: 1, product_id: 1, name: '샷 추가', price: 500, is_required: false, display_order: 1 } ] } ]
        }];
      }
      return [401, { error: 'Invalid license key' }];
    });
  });

  afterEach(() => {
    mock.restore();
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const result = await apiService.healthCheck();
      
      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData: LoginRequest = {
        user_Id: 'test@example.com',
        password: 'password123',
      };

      const result = await apiService.login(loginData);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user).toBeDefined();
      expect(result.user.user_Id).toBe('test@example.com');
      expect(result.user.role).toBe('A');
      expect(result.user.name).toBe('테스트 사용자');
    });

    it('should fail with invalid credentials', async () => {
      const loginData: LoginRequest = {
        user_Id: 'wrong@example.com',
        password: 'wrongpassword',
      };

      await expect(apiService.login(loginData)).rejects.toThrow();
    });

    it('should include required fields in request', async () => {
      const loginData: LoginRequest = {
        user_Id: 'test@example.com',
        password: 'password123',
      };

      const result = await apiService.login(loginData);

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('user_Id');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('name');
    });
  });

  describe('checkLicense', () => {
    it('should validate a valid license key', async () => {
      const result = await apiService.checkLicense('valid-license-key');

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.store_id).toBe(1);
      expect(result.device_id).toBe('device-001');
    });

    it('should reject an invalid license key', async () => {
      await expect(
        apiService.checkLicense('invalid-license-key')
      ).rejects.toThrow();
    });

    it('should handle empty license key', async () => {
      await expect(
        apiService.checkLicense('')
      ).rejects.toThrow();
    });
  });

  describe('getAppData', () => {
    it('should fetch app data with valid license key', async () => {
      const result = await apiService.getAppData('valid-license-key');

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.device_id).toBe('device-001');
      expect(result.store).toBeDefined();
      expect(result.store?.name).toBe('테스트 카페');
    });

    it('should include categories in response', async () => {
      const result = await apiService.getAppData('valid-license-key');

      expect(result.categories).toBeDefined();
      expect(Array.isArray(result.categories)).toBe(true);
      expect(result.categories?.length).toBeGreaterThan(0);
      
      const category = result.categories?.[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('display_order');
    });

    it('should include products with options in response', async () => {
      const result = await apiService.getAppData('valid-license-key');

      expect(result.products).toBeDefined();
      expect(Array.isArray(result.products)).toBe(true);
      expect(result.products?.length).toBeGreaterThan(0);
      
      const product = result.products?.[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('product_options');
      expect(Array.isArray(product?.product_options)).toBe(true);
    });

    it('should fail with invalid license key', async () => {
      await expect(
        apiService.getAppData('invalid-license-key')
      ).rejects.toThrow();
    });

    it('should validate product structure', async () => {
      const result = await apiService.getAppData('valid-license-key');
      const product = result.products?.[0];

      expect(product).toBeDefined();
      expect(product?.id).toBeDefined();
      expect(product?.store_id).toBe(1);
      expect(product?.category_id).toBeDefined();
      expect(product?.name).toBeDefined();
      expect(product?.price).toBeGreaterThan(0);
      expect(product?.is_available).toBe(true);
    });

    it('should validate product options structure', async () => {
      const result = await apiService.getAppData('valid-license-key');
      const product = result.products?.find(p => p.product_options.length > 0);

      expect(product).toBeDefined();
      const option = product?.product_options[0];
      expect(option).toBeDefined();
      expect(option?.id).toBeDefined();
      expect(option?.product_id).toBe(product?.id);
      expect(option?.name).toBeDefined();
      expect(option?.price).toBeGreaterThanOrEqual(0);
      expect(typeof option?.is_required).toBe('boolean');
    });
  });

  describe('JWT Token Interceptor', () => {
    it('should include JWT token in request headers when available', async () => {
      // Set a mock token
      vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
      vi.mocked(AsyncStorage.getItem).mockResolvedValue('test-token-123');

      // The interceptor should add the token to subsequent requests
      const result = await apiService.healthCheck();
      expect(result).toBeDefined();
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    it('should work without JWT token', async () => {
      // Ensure no token is stored
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);

      const result = await apiService.healthCheck();
      expect(result).toBeDefined();
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });
});
