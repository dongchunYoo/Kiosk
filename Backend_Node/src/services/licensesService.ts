import { getKysely } from '../config/kysely-setup';
import { extractInsertId } from '../utils/dbHelpers';
import { logDebug, logError } from '../utils/logger';
type License = { id: number; license_key: string; meta?: any; expiry_dt?: string | null; device_id?: string | null; uuid?: string | null; store_id?: number | null; active?: number | null };

// In-memory fallback store (used when DB table missing)
const memoryStore: License[] = [];
let nextId = 1;

export async function listLicenses(_opts?: { store_id?: number } | any): Promise<License[]> {
  try {
    const db = getKysely();
    // Allow optional filtering by store_id if provided
    const q = db.selectFrom('license').select(['id', 'license_key', 'expiry_dt', 'device_id', 'uuid', 'store_id', 'active', 'meta']).limit(100);
    if (_opts && _opts.store_id) {
      q.where('store_id', '=', Number(_opts.store_id));
    }
    const rows = await q.execute();
    logDebug(`[licensesService] listLicenses rows fetched: ${Array.isArray(rows) ? rows.length : 0}`);
    if (Array.isArray(rows) && rows.length > 0) logDebug('[licensesService] sample row:', rows[0]);
    return (rows as any[]).map((r) => ({ id: r.id, license_key: r.license_key, expiry_dt: r.expiry_dt || null, device_id: r.device_id || r.deviceId || null, uuid: r.uuid || null, store_id: r.store_id || null, active: r.active || null, meta: r.meta || null }));
  } catch (err: any) {
    logError('[licensesService] listLicenses error, falling back to memory store', err);
    return memoryStore.slice();
  }
}

export async function createLicense(license_key: string, meta?: any): Promise<License> {
  try {
    const db = getKysely();
    const res = await db.insertInto('license').values({ license_key }).execute();
    const insertId = extractInsertId(res) || nextId++;
    return { id: insertId, license_key };
  } catch (err) {
    const l = { id: nextId++, license_key, meta };
    memoryStore.push(l);
    return l;
  }
}

export async function findByKey(key: string): Promise<License | null> {
  try {
    const db = getKysely();
    const rows = await db.selectFrom('license').select(['id', 'license_key']).where('license_key', '=', key).limit(1).execute();
    if (rows && rows.length) return { id: Number((rows[0] as any).id) || nextId++, license_key: (rows[0] as any).license_key };
    return null;
  } catch (err) {
    return memoryStore.find((m) => m.license_key === key) || null;
  }
}

export default { listLicenses, createLicense, findByKey };
