import { Request, Response } from 'express';
import { getAppDataSummary } from '../services/appdataService';

export async function getAppDataHandler(req: Request, res: Response) {
  const licenseKey = (req.query && (req.query.license_key as string)) || (req.query && (req.query.licenseKey as string)) || undefined;
  const summary = await getAppDataSummary(licenseKey);
  res.json(summary);
}

export default { getAppDataHandler };
