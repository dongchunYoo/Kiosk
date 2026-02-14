import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';

describe('Auth integration', () => {
  it('registers and logs in a user', async () => {
    const app = await createServer();

    const unique = `smoke_${Date.now()}`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ user_Id: unique, password: 'TestPass123!', role: 'A', name: 'Vitest User' })
      .set('Accept', 'application/json');

    // registration returns 201 Created
    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty('id');
    expect(registerRes.body).toHaveProperty('user_Id', unique);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ user_Id: unique, password: 'TestPass123!' })
      .set('Accept', 'application/json');

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    expect(loginRes.body).toHaveProperty('user');
    expect(loginRes.body.user).toHaveProperty('user_Id', unique);
  }, 15000);
});
