import { Request, Response, NextFunction } from 'express';

export function isSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  // Accept role 'A' as admin (legacy), or explicit 'superadmin'/'admin'
  const role = user && user.role;
  if (role === 'A' || role === 'admin' || role === 'superadmin') return next();
  return res.status(403).json({ error: 'forbidden' });
}

export default isSuperAdmin;
