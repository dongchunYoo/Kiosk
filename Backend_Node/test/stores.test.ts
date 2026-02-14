import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';
import fs from 'fs';
import path from 'path';

describe('Stores integration', () => {
  it('creates a store without image', async () => {
    const app = await createServer();
    const res = await request(app).post('/api/stores').send({ name: 'No Image Store' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'No Image Store');
  });

  it('uploads an image and creates store', async () => {
    const app = await createServer();
    const fixturesDir = path.join(process.cwd(), 'Backend_Node', 'test', 'fixtures');
    if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });
    const dummy = path.join(fixturesDir, 'dummy.txt');
    fs.writeFileSync(dummy, 'dummy');

    const res = await request(app)
      .post('/api/stores')
      .field('name', 'Image Store')
      .attach('image', dummy);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('image');
    // image should be accessible under /uploads
    const imageUrl = res.body.image as string;
    const getImg = await request(app).get(imageUrl);
    expect(getImg.status).toBe(200);
  });
});
