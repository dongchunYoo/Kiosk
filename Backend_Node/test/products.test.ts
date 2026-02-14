import 'dotenv/config';
import { beforeAll, beforeEach, test, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';
import { clearInMemoryProducts } from '../src/services/productsService';
import fs from 'fs';
import path from 'path';

let app: any;
let token: string | undefined;

beforeAll(async () => {
  app = await createServer();
  // create a test user and obtain token
  const unique = `prod_test_${Date.now()}`;
  await request(app)
    .post('/api/auth/register')
    .send({ user_Id: unique, password: 'ProdPass1!', role: 'A', name: 'Prod Tester' });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ user_Id: unique, password: 'ProdPass1!' });
  token = login.body && login.body.token;
});

beforeEach(() => {
  clearInMemoryProducts();
});

test('create -> list -> update -> delete product', async () => {
  // create
  const createRes = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send({ name: 'T1', price: 100 });
  expect(createRes.status).toBe(201);
  expect(createRes.body.ok).toBe(true);
  const id = createRes.body.data.id;

  // list
  const listRes = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`);
  expect(listRes.status).toBe(200);
  expect(Array.isArray(listRes.body.data)).toBe(true);

  // update
  const upd = await request(app).put(`/api/products/${id}`).set('Authorization', `Bearer ${token}`).send({ name: 'T1-mod' });
  expect(upd.status).toBe(200);
  expect(upd.body.ok).toBe(true);

  // delete
  const del = await request(app).post('/api/products/delete').set('Authorization', `Bearer ${token}`).send({ id });
  expect(del.status).toBe(200);
  expect(del.body.ok).toBe(true);
});

test('upload image for product', async () => {
  // create store product upload path
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  const storeId = 'teststore';
  const targetDir = path.join(uploadDir, 'products', storeId);
  fs.mkdirSync(targetDir, { recursive: true });

  const res = await request(app)
    .post('/api/products/upload/product')
    .set('Authorization', `Bearer ${token}`)
    .set('x-store-id', storeId)
    .attach('image', Buffer.from([0x89,0x50,0x4E,0x47]), 'test.png');

  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(res.body.data && res.body.data.path).toBeTruthy();
});
