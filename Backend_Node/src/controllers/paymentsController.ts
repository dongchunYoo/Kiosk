import { Request, Response } from 'express';
import * as paymentsService from '../services/paymentsService';

export async function createPaymentHandler(req: Request, res: Response) {
  const { amount, currency } = req.body;
  if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ error: 'invalid amount' });
  const p = await paymentsService.createPayment(amount, currency || 'KRW');
  res.status(201).json(p);
}

export async function getPaymentHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const p = await paymentsService.getPayment(id);
  if (!p) return res.status(404).json({ error: 'not found' });
  res.json(p);
}

export default { createPaymentHandler, getPaymentHandler };
