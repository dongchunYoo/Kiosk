import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';

describe('AppData integration', () => {
  it('returns basic appdata summary', async () => {
    const app = await createServer();
    const res = await request(app).get('/api/appdata');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('db');
  });
});
