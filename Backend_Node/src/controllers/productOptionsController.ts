import * as optionsService from '../services/productOptionsService';
import { Request, Response } from 'express';

export const listOptions = async (req: Request, res: Response) => {
  const productId = req.query.productId || req.body.productId;
  try {
    const rows = await optionsService.getOptions(productId);
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'failed' });
  }
};

export const createOption = async (req: Request, res: Response) => {
  const body = req.body || {};
  try {
    const o = await optionsService.createOption(body);
    res.status(201).json({ ok: true, data: o });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'create_failed' });
  }
};

export const updateOption = async (req: Request, res: Response) => {
  const id = req.params.id || req.body.id;
  const patch = req.body || {};
  if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
  try {
    const u = await optionsService.updateOption(id, patch);
    res.json({ ok: true, data: u });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'update_failed' });
  }
};

export const deleteOption = async (req: Request, res: Response) => {
  const id = req.params.id || req.body.id;
  if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
  try {
    const ok = await optionsService.deleteOption(id);
    res.json({ ok: true, data: ok });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'delete_failed' });
  }
};
