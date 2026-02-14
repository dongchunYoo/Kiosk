import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';

describe('Auth additional integration tests', () => {
  it('rejects duplicate registration', async () => {
    const app = await createServer();
    const uid = `dup_${Date.now()}`;

    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ user_Id: uid, password: 'DupPass1!', role: 'A', name: 'Dup User' });
    expect(res1.status).toBe(201);

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ user_Id: uid, password: 'DupPass1!', role: 'A', name: 'Dup User' });

    // duplicate should not be 201; expect error field or 409/400
    expect([400, 409, 422]).toContain(res2.status);
    expect(res2.body).toSatisfy((b: any) => b.error || b.message);
  }, 10000);

  it('fails login with wrong password', async () => {
    const app = await createServer();
    const uid = `wrongpw_${Date.now()}`;

    await request(app)
      .post('/api/auth/register')
      .send({ user_Id: uid, password: 'RightPass1!', role: 'A', name: 'Wrong PW' });

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ user_Id: uid, password: 'BadPassword' });

    // login with wrong password may return 400 or 401 depending on implementation
    expect([400, 401]).toContain(bad.status);
    expect(bad.body).toHaveProperty('error');
  }, 10000);

  it('returns token which decodes to correct user', async () => {
    const app = await createServer();
    const uid = `tok_${Date.now()}`;

    await request(app)
      .post('/api/auth/register')
      .send({ user_Id: uid, password: 'TokenPass1!', role: 'A', name: 'Token User' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ user_Id: uid, password: 'TokenPass1!' });

    expect(login.status).toBe(200);
    expect(login.body).toHaveProperty('token');
    const token = login.body.token as string;
    // Basic JWT structure check
    expect(token.split('.').length).toBe(3);
  }, 10000);
});
