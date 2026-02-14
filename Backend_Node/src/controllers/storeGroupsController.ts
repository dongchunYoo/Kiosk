import { Request, Response } from 'express';
import * as storeGroupsService from '../services/storeGroupsService';

export async function listHandler(_req: Request, res: Response) {
  const list = await storeGroupsService.listStoreGroups();
  res.json(list);
}

export async function createHandler(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const created = await storeGroupsService.createStoreGroup(name);
  res.status(201).json(created);
}

export default { listHandler, createHandler };
