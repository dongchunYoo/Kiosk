// Placeholder types and notes for Kysely integration.
// This file does NOT add Kysely as a runtime dependency. It's a helper to
// show how to map `src/types/db.ts` -> Kysely typed DB when you install Kysely.

/*
Example usage after installing Kysely:

import { Kysely, MysqlDialect } from 'kysely';
import { Pool } from 'mysql2/promise';
import DbTypes from '../types/db';

export function createKysely(pool: Pool) {
  return new Kysely<DbTypes>({
    dialect: new MysqlDialect({ pool })
  });
}

*/

export type KyselyDbPlaceholder = import('../types/db').DbTypes;

// TODO: install `kysely` and `@kysely/mysql` then replace this helper with real integration.
