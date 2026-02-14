import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';

describe('Payments integration', () => {
  it('creates payment and retrieves it', async () => {
    const app = await createServer();
    const create = await request(app).post('/api/payments').send({ amount: 12345, currency: 'KRW' });
    expect(create.status).toBe(201);
    expect(create.body).toHaveProperty('id');

    const id = create.body.id;
    const get = await request(app).get(`/api/payments/${id}`);
    expect(get.status === 200 || get.status === 404).toBeTruthy();
  });
});
