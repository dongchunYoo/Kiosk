import { getKysely } from '../config/kysely-setup';
import { UsersRow, Id } from '../types/db';
import { extractInsertId } from '../utils/dbHelpers';

type User = { id: Id; user_Id: string; name: string; role: string };

const memory: Array<User> = [];
let nextId = 1;

export async function listUsers(): Promise<User[]> {
  try {
    const db = getKysely();
    const rows = await db.selectFrom('users').select(['id', 'user_Id', 'name', 'role']).limit(100).execute();
    return rows as unknown as User[];
  } catch (err) {
    return memory.slice();
  }
}

export async function createUser(user_Id: string, name?: string, role?: string): Promise<User> {
  try {
    const db = getKysely();
    const res = await db.insertInto('users').values({ user_Id, name: name || '', role: role || 'A' }).execute();
    const insertId = extractInsertId(res) || nextId++;
    return { id: insertId, user_Id, name: name || '', role: role || 'A' } as User;
  } catch (err) {
    const u = { id: nextId++, user_Id, name: name || '', role: role || 'A' } as User & { id: Id };
    memory.push(u);
    return u as User;
  }
}

export async function findByUserId(user_Id: string): Promise<User | null> {
  try {
    const db = getKysely();
    const rows = await db.selectFrom('users').selectAll().where('user_Id', '=', user_Id).limit(1).execute();
    if (rows && rows.length) return rows[0] as unknown as User;
    return null;
  } catch (err) {
    return memory.find((m) => m.user_Id === user_Id) || null;
  }
}

export async function updateUser(id: number | string, patch: Partial<User>): Promise<User | null> {
  try {
    const db = getKysely();
    await db.updateTable('users').set(patch as any).where('id', '=', Number(id)).execute();
    return { id: Number(id), ...(patch as any) } as User;
  } catch (err) {
    const idx = memory.findIndex(m => String(m.id) === String(id));
    if (idx >= 0) {
      memory[idx] = { ...memory[idx], ...patch } as User;
      return memory[idx];
    }
    return null;
  }
}

export async function deleteUser(id: number | string): Promise<boolean> {
  try {
    const db = getKysely();
    await db.deleteFrom('users').where('id', '=', Number(id)).execute();
    return true;
  } catch (err) {
    const before = memory.length;
    for (let i = memory.length - 1; i >= 0; i--) {
      if (String(memory[i].id) === String(id)) memory.splice(i, 1);
    }
    return memory.length < before;
  }
}

export default { listUsers, createUser, findByUserId };
