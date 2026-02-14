import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import appdataRouter from './routes/appdata';
import licensesRouter from './routes/licenses';
import storesRouter from './routes/stores';
import storeGroupsRouter from './routes/store-groups';
import productOptionsRouter from './routes/product-options';
import categoriesRouter from './routes/categories';
import paymentsRouter from './routes/payments';
import adminRouter from './routes/admin';
import usersRouter from './routes/users';
import { initDb } from './config/db';

export async function createServer() {
  const app = express();
  
  // CORS 설정 (프로덕션 환경에서는 특정 도메인만 허용)
  const corsOptions = {
    origin: process.env.DEV_MODE === 'true' 
      ? '*' // 개발 환경: 모든 도메인 허용
      : ['https://kioskfront.ydc1981.pe.kr', 'https://ydc1981.pe.kr'], // 프로덕션: 특정 도메인만
    credentials: true,
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));
  
  app.use(bodyParser.json());

  // init DB pool
  await initDb();

  // ensure uploads directory exists and serve it statically
  const fs = await import('fs');
  const path = await import('path');
  // Ensure uploads directory is Backend_Node/uploads regardless of cwd
  const cwd = process.cwd();
  const baseDir = cwd.endsWith('Backend_Node') || cwd.includes(path.sep + 'Backend_Node' + path.sep) ? cwd : path.join(cwd, 'Backend_Node');
  const uploadsDir = path.join(baseDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  // Serve uploaded assets under both `/uploads` and `/image` for frontend compatibility
  app.use('/uploads', (await import('express')).default.static(uploadsDir));
  app.use('/image', (await import('express')).default.static(uploadsDir));

  app.use('/api/auth', authRouter);
  // compatibility route used by legacy clients (Flutter / migrated RN)
  try {
    // load dynamically to avoid crashing when the file is missing during hot-reload
    // prefer ES dynamic import so ts-node-dev can resolve .ts files
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const licenseAuth = await import('./routes/licenseAuth');
    if (licenseAuth && licenseAuth.default) app.use('/license-auth', licenseAuth.default);
  } catch (err) {
    // route missing is non-fatal; log and continue
    // Use console here to avoid logger circularity during early startup
    // but prefer the project's logger when available
    try {
      const { logInfo } = await import('./utils/logger');
      logInfo('Optional route /license-auth not mounted (module not found)');
    } catch (_) {
      // fallback
      // eslint-disable-next-line no-console
      console.info('Optional route /license-auth not mounted (module not found)');
    }
  }
  app.use('/api/appdata', appdataRouter);
  // backward-compatible aliases for legacy clients (no /api prefix)
  app.use('/appdata', appdataRouter);
  app.use('/auth', authRouter);
  app.use('/licenses', licensesRouter);
  app.use('/stores', storesRouter);
  app.use('/store-groups', storeGroupsRouter);
  app.use('/product-options', productOptionsRouter);
  app.use('/products', productsRouter);
  app.use('/categories', categoriesRouter);
  app.use('/payments', paymentsRouter);
  app.use('/admin', adminRouter);
  app.use('/users', usersRouter);
  app.use('/api/licenses', licensesRouter);
  app.use('/api/stores', storesRouter);
  app.use('/api/store-groups', storeGroupsRouter);
  app.use('/api/product-options', productOptionsRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/users', usersRouter);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  return app;
}
