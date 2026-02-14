import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { rest, ctx } from 'msw';

// Mock AsyncStorage before any imports
vi.mock('@react-native-async-storage/async-storage', () => {
  const mockStorage: Record<string, string> = {};
  
  return {
    default: {
      getItem: vi.fn(async (key: string) => mockStorage[key] || null),
      setItem: vi.fn(async (key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn(async (key: string) => {
        delete mockStorage[key];
      }),
      multiRemove: vi.fn(async (keys: string[]) => {
        keys.forEach(key => delete mockStorage[key]);
      }),
      clear: vi.fn(async () => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      }),
    },
  };
});

// MSW server setup
export const handlers = [
  // Health check
  rest.get('http://localhost:3004/health', (_req, res) => {
    return res(
      ctx.json({
        status: 'ok',
        uptime: 12345,
        timestamp: new Date().toISOString(),
      })
    );
  }),

  // Login
  rest.post('http://localhost:3004/auth/login', (req, res) => {
    const body = (req.body as any) || {};

    if (body.user_Id === 'test@example.com' && body.password === 'password123') {
      return res(
        ctx.json({
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: 1,
            user_Id: 'test@example.com',
            role: 'A',
            name: '테스트 사용자',
          },
        })
      );
    }

    return res(ctx.status(401), ctx.json({ success: false, message: 'Invalid credentials' }));
  }),

  // License check
  rest.get('http://localhost:3004/licenses/check', (req, res) => {
    const urlObj = req.url as URL;
    const licenseKey = urlObj.searchParams.get('license_key');

    if (licenseKey === 'valid-license-key') {
      return res(ctx.json({ valid: true, store_id: 1, device_id: 'device-001' }));
    }

    return res(ctx.status(400), ctx.json({ valid: false }));
  }),

  // AppData
  rest.get('http://localhost:3004/appdata', (req, res) => {
    const urlObj = req.url as URL;
    const licenseKey = urlObj.searchParams.get('license_key');

    if (licenseKey === 'valid-license-key') {
      return res(
        ctx.json({
          id: 1,
          device_id: 'device-001',
          store: {
            id: 1,
            name: '테스트 카페',
            owner_id: 1,
            address: '서울시 강남구',
            timezone: 'Asia/Seoul',
          },
          categories: [
            { id: 1, store_id: 1, name: '커피', description: '커피 메뉴', display_order: 1 },
            { id: 2, store_id: 1, name: '음료', description: '음료 메뉴', display_order: 2 },
          ],
          products: [
            {
              id: 1,
              store_id: 1,
              category_id: 1,
              name: '아메리카노',
              description: '기본 아메리카노',
              price: 4000,
              image_url: '/uploads/products/americano.jpg',
              is_available: true,
              display_order: 1,
              product_options: [{ id: 1, product_id: 1, name: '샷 추가', price: 500, is_required: false, display_order: 1 }],
            },
            {
              id: 2,
              store_id: 1,
              category_id: 1,
              name: '카페라떼',
              description: '부드러운 라떼',
              price: 4500,
              image_url: '/uploads/products/latte.jpg',
              is_available: true,
              display_order: 2,
              product_options: [],
            },
          ],
        })
      );
    }

    return res(ctx.status(401), ctx.json({ error: 'Invalid license key' }));
  }),
];

export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
