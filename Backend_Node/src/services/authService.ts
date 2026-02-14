import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getKysely } from '../config/kysely-setup';

const SALT_ROUNDS = 10;

export async function registerUser(payload: any) {
  const { user_Id, password, name } = payload;
  if (!user_Id || !password) {
    const e: any = new Error('user_Id and password required');
    e.status = 400;
    throw e;
  }

  const db = getKysely();
  const rows = await db.selectFrom('users').select(['id']).where('user_Id', '=', user_Id).limit(1).execute();
  if (rows && rows.length > 0) {
    const e: any = new Error('user already exists');
    e.status = 409;
    throw e;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  await db.insertInto('users').values({ user_Id, password: hashed, name: name || null }).execute();
  const created = await db.selectFrom('users').select(['id', 'user_Id']).where('user_Id', '=', user_Id).limit(1).execute();
  return created && created[0] ? { id: (created[0] as any).id, user_Id: (created[0] as any).user_Id } : { user_Id };
}

export async function loginUser(payload: any) {
  const { user_Id, password } = payload;
  if (!user_Id || !password) {
    const e: any = new Error('user_Id and password required');
    e.status = 400;
    throw e;
  }

  const db = getKysely();
  const rows = await db.selectFrom('users').select(['id', 'user_Id', 'password', 'role']).where('user_Id', '=', user_Id).limit(1).execute();
  const user = rows && rows[0];
  if (!user) {
    const e: any = new Error('invalid credentials');
    e.status = 401;
    throw e;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const e: any = new Error('invalid credentials');
    e.status = 401;
    throw e;
  }

  const secret = process.env.JWT_SECRET || 'change_me_jwt_secret';
  const token = jwt.sign({ id: user.id, user_Id: user.user_Id, role: user.role }, secret, { expiresIn: '1d' });
  return { token, user: { id: user.id, user_Id: user.user_Id, role: user.role } };
}
