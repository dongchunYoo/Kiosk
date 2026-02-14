import { getKysely } from '../config/kysely-setup';

export async function getStats() {
  try {
    const db = getKysely();
    const usersRes = await db.selectFrom('users').select(db.fn.count('id').as('cnt') as any).execute();
    const licensesRes = await db.selectFrom('license').select(db.fn.count('id').as('cnt') as any).execute();
    const storesRes = await db.selectFrom('stores').select(db.fn.count('id').as('cnt') as any).execute();
    const paymentsRes = await db.selectFrom('PaymentReceipt').select(db.fn.count('id').as('cnt') as any).execute();

    const usersCount = Number((usersRes && usersRes[0] && (usersRes[0] as any).cnt) || 0);
    const licensesCount = Number((licensesRes && licensesRes[0] && (licensesRes[0] as any).cnt) || 0);
    const storesCount = Number((storesRes && storesRes[0] && (storesRes[0] as any).cnt) || 0);
    const paymentsCount = Number((paymentsRes && paymentsRes[0] && (paymentsRes[0] as any).cnt) || 0);

    return {
      status: 'ok',
      db: true,
      counts: { users: usersCount, licenses: licensesCount, stores: storesCount, payments: paymentsCount },
    };
  } catch (err) {
    return {
      status: 'ok',
      db: false,
      counts: { users: null, licenses: null, stores: null, payments: null },
    };
  }
}

export default { getStats };
