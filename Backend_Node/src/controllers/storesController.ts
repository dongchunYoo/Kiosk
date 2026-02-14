import { Request, Response } from 'express';
import * as storesService from '../services/storesService';

export async function listHandler(_req: Request, res: Response) {
  const list = await storesService.listStores();
  res.json(list);
}

export async function createHandler(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  // multer places uploaded file at req.file
  const file = (req as any).file;
  const imagePath = file ? `/uploads/${file.filename}` : undefined;
  const created = await storesService.createStore(name, imagePath);
  res.status(201).json(created);
}

export async function getHandler(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: 'missing id' });
  const store = await storesService.getStoreById(id);
  if (!store) return res.status(404).json({ error: 'not found' });
  // return raw store object (frontend expects storeRes.data.name)
  res.json(store);
}

export default { listHandler, createHandler };
