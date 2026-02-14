import { getKysely } from '../config/kysely-setup';
import DbTypes from '../types/db';
import { extractInsertId } from '../utils/dbHelpers';

type Payment = { id: number; amount: number; currency: string; status: string };

const memory: Payment[] = [];
let nextId = 1;
export async function createPayment(amount: number, currency = 'KRW'): Promise<Payment> {
  try {
    const db = getKysely();
    const res = await db.insertInto('PaymentReceipt').values({ total_amount: String(amount), status: 'processing' }).execute();
    const insertId = extractInsertId(res) || nextId++;
    return { id: insertId, amount, currency, status: 'processing' };
  } catch (err) {
    const p = { id: nextId++, amount, currency, status: 'created' };
    memory.push(p);
    return p;
  }
}

export async function getPayment(id: number): Promise<Payment | null> {
  try {
    const db = getKysely();
    const rows = await db.selectFrom('PaymentReceipt').select(['id', 'total_amount', 'status']).where('id', '=', Number(id)).limit(1).execute();
    const r: any = rows && rows[0];
    if (r) return { id: r.id, amount: r.total_amount ? Number(r.total_amount) : 0, currency: 'KRW', status: r.status || 'unknown' };
    return null;
  } catch (err) {
    return memory.find((m) => m.id === id) || null;
  }
}

export default { createPayment, getPayment };
