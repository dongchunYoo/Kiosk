import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';

describe('Admin integration', () => {
  it('returns stats object', async () => {
    const app = await createServer();
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('db');
    expect(res.body).toHaveProperty('counts');
  });
});
