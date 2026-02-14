import 'dotenv/config';
import { beforeAll, beforeEach, test, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';
import { clearInMemoryCategories } from '../src/services/categoriesService';

let app: any;
let token: string | undefined;

beforeAll(async () => {
  app = await createServer();
  const unique = `cat_test_${Date.now()}`;
  await request(app)
    .post('/api/auth/register')
    .send({ user_Id: unique, password: 'CatPass1!', role: 'A', name: 'Cat Tester' });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ user_Id: unique, password: 'CatPass1!' });
  token = login.body && login.body.token;
});

beforeEach(() => {
  clearInMemoryCategories();
});

test('create -> list -> update -> delete category', async () => {
  const createRes = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: 'Beverages' });
  expect(createRes.status).toBe(201);
  expect(createRes.body.ok).toBe(true);
  const id = createRes.body.data.id;

  const listRes = await request(app).get('/api/categories').set('Authorization', `Bearer ${token}`);
  expect(listRes.status).toBe(200);
  expect(Array.isArray(listRes.body.data)).toBe(true);

  const upd = await request(app).put(`/api/categories/${id}`).set('Authorization', `Bearer ${token}`).send({ name: 'Drinks' });
  expect(upd.status).toBe(200);
  expect(upd.body.ok).toBe(true);

  const del = await request(app).post('/api/categories/delete').set('Authorization', `Bearer ${token}`).send({ id });
  expect(del.status).toBe(200);
  expect(del.body.ok).toBe(true);
});
