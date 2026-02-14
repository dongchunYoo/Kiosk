import { Request, Response } from 'express';
import * as licensesService from '../services/licensesService';
import jwt from 'jsonwebtoken';
import { logInfo, logError } from '../utils/logger';

export async function loginHandler(req: Request, res: Response) {
  try {
    const { license_key } = req.body || {};
    if (!license_key) return res.status(400).json({ error: 'license_key required' });

    const found = await licensesService.findByKey(String(license_key));
    if (!found) return res.status(401).json({ success: false, error: 'invalid_license' });

    const secret = process.env.JWT_SECRET || 'change_me_jwt_secret';
    const token = jwt.sign(
      { license_id: found.id, license_key: found.license_key } as any,
      secret as any,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );

    logInfo(`[licenseAuth] issued token for license ${found.license_key}`);
    return res.json({ success: true, token, license_key: found.license_key });
  } catch (err) {
    logError('[licenseAuth] loginHandler error', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

export default { loginHandler };
