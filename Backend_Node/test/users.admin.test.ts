import 'dotenv/config';
import { test, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';

let app: any;
let adminToken: string | undefined;

beforeAll(async () => {
  app = await createServer();
  const adminId = `admin_${Date.now()}`;
  await request(app).post('/api/auth/register').send({ user_Id: adminId, password: 'AdminPass1!', role: 'A', name: 'Admin' });
  const login = await request(app).post('/api/auth/login').send({ user_Id: adminId, password: 'AdminPass1!' });
  adminToken = login.body && login.body.token;
});

test('admin updates and deletes user', async () => {
  // create regular user via public endpoint
  const uid = `u_${Date.now()}`;
  const create = await request(app).post('/api/users').send({ user_Id: uid, name: 'User X', role: 'U' });
  expect(create.status).toBe(201);
  const id = create.body.id;

  // update as admin
  const upd = await request(app).put('/api/users/update').set('Authorization', `Bearer ${adminToken}`).send({ id, name: 'User X2' });
  expect(upd.status).toBe(200);
  expect(upd.body.ok).toBe(true);

  // delete as admin
  const del = await request(app).post('/api/users/delete').set('Authorization', `Bearer ${adminToken}`).send({ id });
  expect(del.status).toBe(200);
  expect(del.body.ok).toBe(true);
});
