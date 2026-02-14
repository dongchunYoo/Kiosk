import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';

describe('Licenses integration', () => {
  it('creates and checks a license key', async () => {
    const app = await createServer();
    const key = `lk_${Date.now()}`;

    const createRes = await request(app).post('/api/licenses').send({ license_key: key });
    expect([201, 200]).toContain(createRes.status);
    expect(createRes.body).toHaveProperty('license_key');

    const checkRes = await request(app).post('/api/licenses/check-key').send({ key });
    expect(checkRes.status).toBe(200);
    expect(checkRes.body).toHaveProperty('valid');
    expect(checkRes.body.valid).toBe(true);
  }, 10000);
});
