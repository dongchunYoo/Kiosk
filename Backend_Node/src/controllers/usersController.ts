import { Request, Response } from 'express';
import * as usersService from '../services/usersService';

export async function listHandler(_req: Request, res: Response) {
  const list = await usersService.listUsers();
  res.json(list);
}

export async function createHandler(req: Request, res: Response) {
  const { user_Id, name, role } = req.body;
  if (!user_Id) return res.status(400).json({ error: 'user_Id required' });
  const created = await usersService.createUser(user_Id, name, role);
  res.status(201).json(created);
}

export async function findHandler(req: Request, res: Response) {
  const { user_Id } = req.params;
  const u = await usersService.findByUserId(user_Id);
  if (!u) return res.status(404).json({ error: 'not found' });
  res.json(u);
}

export default { listHandler, createHandler, findHandler };

export async function updateHandler(req: Request, res: Response) {
  const id = req.body.id || req.params.id;
  const patch = req.body || {};
  if (!id) return res.status(400).json({ error: 'missing id' });
  const updated = await usersService.updateUser(id, patch as any);
  if (!updated) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true, data: updated });
}

export async function deleteHandler(req: Request, res: Response) {
  const id = req.body.id || req.params.id;
  if (!id) return res.status(400).json({ error: 'missing id' });
  const ok = await usersService.deleteUser(id);
  res.json({ ok, data: ok });
}
