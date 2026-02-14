import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';

describe('Users integration', () => {
  it('creates and finds a user', async () => {
    const app = await createServer();
    const uid = `user_${Date.now()}`;
    const create = await request(app).post('/api/users').send({ user_Id: uid, name: 'User Test', role: 'U' });
    expect(create.status).toBe(201);
    expect(create.body).toHaveProperty('user_Id', uid);

    const find = await request(app).get(`/api/users/${uid}`);
    expect(find.status).toBe(200);
    expect(find.body).toHaveProperty('user_Id', uid);
  });
});
