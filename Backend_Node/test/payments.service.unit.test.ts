import { describe, it, expect, vi } from 'vitest';

// mock the db module to force fallback
vi.mock('../src/config/db', () => ({ getPool: () => { throw new Error('no db'); } }));

import * as paymentsService from '../src/services/paymentsService';

describe('Payments service (unit)', () => {
  it('creates payment using fallback when DB unavailable', async () => {
    const p = await paymentsService.createPayment(5000, 'KRW');
    expect(p).toHaveProperty('id');
    expect(p.amount).toBe(5000);
    expect(p.currency).toBe('KRW');
  });

  it('gets existing fallback payment', async () => {
    const p = await paymentsService.createPayment(7000, 'KRW');
    const fetched = await paymentsService.getPayment(p.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.amount).toBe(7000);
  });
});
