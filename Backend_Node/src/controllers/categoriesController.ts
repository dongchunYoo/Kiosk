import * as categoriesService from '../services/categoriesService';
import { Request, Response } from 'express';

export const listCategories = async (req: Request, res: Response) => {
  try {
    const rows = await categoriesService.getCategories();
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'failed' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const body = req.body || {};
  if (!body.name) return res.status(400).json({ ok: false, error: 'missing_name' });
  try {
    const cat = await categoriesService.createCategory(body);
    res.status(201).json({ ok: true, data: cat });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'create_failed' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const id = req.params.id || req.body.id;
  const patch = req.body || {};
  if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
  try {
    const updated = await categoriesService.updateCategory(id, patch);
    res.json({ ok: true, data: updated });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'update_failed' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const id = req.params.id || req.body.id;
  if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
  try {
    const ok = await categoriesService.deleteCategory(id);
    res.json({ ok: true, data: ok });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'delete_failed' });
  }
};

export const getCategoriesForStore = async (req: Request, res: Response) => {
  try {
    const storeId = req.params.id;
    if (!storeId) return res.status(400).json({ ok: false, error: 'missing_id' });
    const rows = await (await import('../services/categoriesService')).getCategoriesByStoreId(storeId);
    // return raw array for frontend convenience
    res.json(rows);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'failed' });
  }
};
