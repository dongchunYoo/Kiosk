import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid Authorization' });
  const token = parts[1];
  try {
    const secret = process.env.JWT_SECRET || 'change_me_jwt_secret';
    const payload = jwt.verify(token, secret);
    (req as any).user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
