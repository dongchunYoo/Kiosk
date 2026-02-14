import * as productsService from '../services/productsService';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

export const listProducts = async (req: Request, res: Response) => {
  const storeId = (req.query.storeId as string) || (req.headers['x-store-id'] as string) || undefined;
  try {
    const rows = await productsService.getProducts(storeId);
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'failed' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const body = req.body || {};
  try {
    const product = await productsService.createProduct(body);
    res.status(201).json({ ok: true, data: product });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'create_failed' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const id = req.params.id || (req.body && req.body.id);
  const patch = req.body || {};
  if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
  try {
    const updated = await productsService.updateProduct(id, patch);
    res.json({ ok: true, data: updated });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'update_failed' });
  }
};

export const removeProduct = async (req: Request, res: Response) => {
  const id = req.params.id || (req.body && req.body.id);
  if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
  try {
    const ok = await productsService.deleteProduct(id);
    res.json({ ok: true, data: ok });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'delete_failed' });
  }
};

export const uploadProductImage = async (req: Request, res: Response) => {
  // multer has stored file to disk
  if (!req.file) return res.status(400).json({ ok: false, error: 'no_file' });
  const storeId = req.headers['x-store-id'] || req.query.storeId || req.params.storeId || 'unknown';
  // Determine base upload dir same as routes/products.ts
  const baseUpload = process.env.UPLOAD_DIR ? path.resolve(String(process.env.UPLOAD_DIR)) : (() => {
    const cwd = process.cwd();
    return cwd.endsWith('Backend_Node') || cwd.includes(path.sep + 'Backend_Node' + path.sep) ? path.join(cwd, 'uploads') : path.join(cwd, 'Backend_Node', 'uploads');
  })();
  // Construct a URL path WITHOUT the leading `uploads` segment so frontend will prefix `/image`.
  const relNoRoot = path.join('products', String(storeId), req.file.filename);
  const url = `/${relNoRoot}`; // e.g. /products/1/1_12345.png
  res.json({ ok: true, url, data: { path: url } });
};

export const deleteProductImage = async (req: Request, res: Response) => {
  const body = req.body || {};
  // Accept either { path: '/products/..' } or { imageUrl: '/image/products/..' } or { path: '/uploads/products/..' }
  const p = body.path || body.imageUrl;
  if (!p) return res.status(400).json({ ok: false, error: 'missing_path' });
  // Determine uploads root same as upload logic
  const uploadsRoot = process.env.UPLOAD_DIR ? path.resolve(String(process.env.UPLOAD_DIR)) : (() => {
    const cwd = process.cwd();
    return cwd.endsWith('Backend_Node') || cwd.includes(path.sep + 'Backend_Node' + path.sep) ? path.join(cwd, 'uploads') : path.join(cwd, 'Backend_Node', 'uploads');
  })();
  // Normalize incoming path: strip possible /image or /uploads prefix
  let normalized = String(p);
  if (normalized.startsWith('/image/')) normalized = normalized.replace(/^\/image/, '');
  if (normalized.startsWith('/uploads/')) normalized = normalized.replace(/^\/uploads/, '');
  // Ensure no leading slash when joining to uploadsRoot
  const target = path.join(uploadsRoot, normalized.replace(/^\//, ''));
  try {
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
      return res.json({ ok: true });
    }
    res.status(404).json({ ok: false, error: 'not_found' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'delete_error' });
  }
};
