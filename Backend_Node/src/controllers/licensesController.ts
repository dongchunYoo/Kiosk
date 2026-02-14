import { Request, Response } from 'express';
import * as licensesService from '../services/licensesService';
import { logDebug, logError } from '../utils/logger';

export async function listHandler(_req: Request, res: Response) {
  try {
    const q = (_req && _req.query) ? _req.query : {};
    logDebug('[licensesController] listHandler called with query:', q);
    const list = await licensesService.listLicenses(q as any);
    logDebug(`[licensesController] listHandler returning rows: ${Array.isArray(list) ? list.length : 0}`);
    res.json({ data: list });
  } catch (err) {
    logError('[licensesController] listHandler error', err);
    res.status(500).json({ error: 'internal_error' });
  }
}

export async function createHandler(req: Request, res: Response) {
  const { license_key, meta } = req.body;
  if (!license_key) return res.status(400).json({ error: 'license_key required' });
  const created = await licensesService.createLicense(license_key, meta);
  res.status(201).json(created);
}

export async function checkKeyHandler(req: Request, res: Response) {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: 'key required' });
  const found = await licensesService.findByKey(key);
  res.json({ valid: !!found, license: found || null });
}

export default { listHandler, createHandler, checkKeyHandler };
