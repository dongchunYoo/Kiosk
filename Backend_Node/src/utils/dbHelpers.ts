export function extractInsertId(res: unknown): number | undefined {
  if (!res) return undefined;
  try {
    // mysql2 returns an object with insertId, but it's not strongly typed through Kysely
    const maybe: any = res;
    if (typeof maybe.insertId === 'number') return maybe.insertId;
    if (typeof maybe[0]?.insertId === 'number') return maybe[0].insertId;
  } catch (e) {
    // ignore
  }
  return undefined;
}
