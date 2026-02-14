import 'dotenv/config';
import { beforeAll, beforeEach, test, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';
import { clearInMemoryOptions } from '../src/services/productOptionsService';

let app: any;
let token: string | undefined;

beforeAll(async () => {
  app = await createServer();
  const unique = `opt_test_${Date.now()}`;
  await request(app)
    .post('/api/auth/register')
    .send({ user_Id: unique, password: 'OptPass1!', role: 'A', name: 'Opt Tester' });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ user_Id: unique, password: 'OptPass1!' });
  token = login.body && login.body.token;
});

beforeEach(() => {
  clearInMemoryOptions();
});

test('create -> list -> update -> delete option', async () => {
  // create
  const createRes = await request(app).post('/api/product-options').set('Authorization', `Bearer ${token}`).send({ productId: 1, name: 'Size L', priceDelta: 200 });
  expect(createRes.status).toBe(201);
  expect(createRes.body.ok).toBe(true);
  const id = createRes.body.data.id;

  // list
  const listRes = await request(app).get('/api/product-options').set('Authorization', `Bearer ${token}`);
  expect(listRes.status).toBe(200);
  expect(Array.isArray(listRes.body.data)).toBe(true);

  // update
  const upd = await request(app).put(`/api/product-options/${id}`).set('Authorization', `Bearer ${token}`).send({ name: 'Size XL' });
  expect(upd.status).toBe(200);
  expect(upd.body.ok).toBe(true);

  // delete
  const del = await request(app).post('/api/product-options/delete').set('Authorization', `Bearer ${token}`).send({ id });
  expect(del.status).toBe(200);
  expect(del.body.ok).toBe(true);
});
