import { getKysely } from '../config/kysely-setup';
import { Id } from '../types/db';
import { extractInsertId } from '../utils/dbHelpers';

type StoreGroup = { id?: Id; name: string };

const memory: Array<StoreGroup & { id: Id }> = [];
let nextId = 1;

export async function listStoreGroups(): Promise<StoreGroup[]> {
  try {
    const db = getKysely();
    const rows = await db.selectFrom('store_groups').select(['id', 'name']).orderBy('id').execute();
    return (Array.isArray(rows) ? rows : []) as any;
  } catch (err) {
    return memory.slice();
  }
}

export async function createStoreGroup(name: string): Promise<StoreGroup> {
  try {
    const db = getKysely();
    const res = await db.insertInto('store_groups').values({ name }).execute();
    const insertId = extractInsertId(res) || nextId++;
    return { id: insertId, name } as StoreGroup & { id: Id };
  } catch (err) {
    const g = { id: nextId++, name } as StoreGroup & { id: Id };
    memory.push(g);
    return g;
  }
}

export default { listStoreGroups, createStoreGroup };
