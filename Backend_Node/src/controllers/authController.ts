import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';

export async function registerHandler(req: Request, res: Response) {
  try {
    const payload = req.body;
    const result = await registerUser(payload);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Internal error' });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const payload = req.body;
    const result = await loginUser(payload);
    res.json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Internal error' });
  }
}
