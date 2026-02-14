import { getKysely } from '../config/kysely-setup';
import { ProductOptionsRow } from '../types/db';
import { Id } from '../types/db';
import { extractInsertId } from '../utils/dbHelpers';

type Option = Partial<Pick<ProductOptionsRow, 'id' | 'product_id' | 'name' | 'price' | 'is_available'>> & { productId?: number | string; priceDelta?: number };

let inMemoryOptions: Array<Option & { id: Id }> = [];

export const getOptions = async (productId?: number | string) => {
  try {
    const db = getKysely();
    if (productId) {
      const rows = await db.selectFrom('product_options').selectAll().where('product_id', '=', Number(productId)).limit(100).execute();
      return rows;
    }
    const rows = await db.selectFrom('product_options').selectAll().limit(500).execute();
    return rows;
  } catch (err) {
    if (productId) return inMemoryOptions.filter(o => String(o.productId) === String(productId));
    return inMemoryOptions;
  }
};

export const createOption = async (opt: Option) => {
  try {
    const db = getKysely();
    const payload = { product_id: Number(opt.product_id || opt.productId || 0), name: opt.name || '', price: String(opt.price || opt.priceDelta || 0) };
    const res = await db.insertInto('product_options').values(payload).execute();
    const insertId = extractInsertId(res) || 0;
    return { ...opt, id: insertId };
  } catch (err) {
    const nextId = inMemoryOptions.length ? (Number(inMemoryOptions[inMemoryOptions.length - 1].id) || 0) + 1 : 1;
    const o = { ...opt, id: nextId };
    inMemoryOptions.push(o as any);
    return o;
  }
};

export const updateOption = async (id: number | string, patch: Partial<Option>) => {
  try {
    const db = getKysely();
    const dbPatch: any = { ...patch };
    if (patch.productId && !patch.product_id) dbPatch.product_id = patch.productId;
    if (patch.priceDelta && !patch.price) dbPatch.price = patch.priceDelta;
    await db.updateTable('product_options').set(dbPatch).where('id', '=', Number(id)).execute();
    return { id, ...patch };
  } catch (err) {
    const idx = inMemoryOptions.findIndex(o => String(o.id) === String(id));
    if (idx >= 0) {
      inMemoryOptions[idx] = { ...inMemoryOptions[idx], ...patch };
      return inMemoryOptions[idx];
    }
    return null;
  }
};

export const deleteOption = async (id: number | string) => {
  try {
    const db = getKysely();
    await db.deleteFrom('product_options').where('id', '=', Number(id)).execute();
    return true;
  } catch (err) {
    const before = inMemoryOptions.length;
    inMemoryOptions = inMemoryOptions.filter(o => String(o.id) !== String(id));
    return inMemoryOptions.length < before;
  }
};

export const clearInMemoryOptions = () => {
  inMemoryOptions = [];
};
