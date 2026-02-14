//++ /Users/yudongchun/Dev/Development/futter_Kiosk/Backend_Node/src/config/kysely-setup.ts
// Minimal Kysely setup example using the local `DbTypes`.
// This file is a lightweight helper to create a typed Kysely instance.
// Run `npm install kysely` before using.

import { Kysely, MysqlDialect } from 'kysely';
import DbTypes from '../types/db';
import { getCallbackPool } from './db';

// Synchronous factory that returns a Kysely instance and the underlying pool.
// This was previously async but did not perform any async work; using a
// synchronous factory simplifies usage and avoids unnecessary `await`s.
export function createKysely() {
  const pool = getCallbackPool();
  const db = new Kysely<DbTypes>({ dialect: new MysqlDialect({ pool }) as any });
  return { db, pool };
}

export type KyselyInstance = ReturnType<typeof createKysely>;

export default createKysely;

// Synchronous cached getter for services to reuse the same Kysely instance
let _cachedKysely: Kysely<DbTypes> | null = null;
export function getKysely(): Kysely<DbTypes> {
  if (!_cachedKysely) {
    const pool = getCallbackPool();
    _cachedKysely = new Kysely<DbTypes>({ dialect: new MysqlDialect({ pool }) as any });
  }
  return _cachedKysely;
}
