"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const kysely_setup_1 = require("../config/kysely-setup");
const SALT_ROUNDS = 10;
async function registerUser(payload) {
    const { user_Id, password, name } = payload;
    if (!user_Id || !password) {
        const e = new Error('user_Id and password required');
        e.status = 400;
        throw e;
    }
    const db = (0, kysely_setup_1.getKysely)();
    const rows = await db.selectFrom('users').select(['id']).where('user_Id', '=', user_Id).limit(1).execute();
    if (rows && rows.length > 0) {
        const e = new Error('user already exists');
        e.status = 409;
        throw e;
    }
    const hashed = await bcrypt_1.default.hash(password, SALT_ROUNDS);
    await db.insertInto('users').values({ user_Id, password: hashed, name: name || null }).execute();
    const created = await db.selectFrom('users').select(['id', 'user_Id']).where('user_Id', '=', user_Id).limit(1).execute();
    return created && created[0] ? { id: created[0].id, user_Id: created[0].user_Id } : { user_Id };
}
async function loginUser(payload) {
    const { user_Id, password } = payload;
    if (!user_Id || !password) {
        const e = new Error('user_Id and password required');
        e.status = 400;
        throw e;
    }
    const db = (0, kysely_setup_1.getKysely)();
    const rows = await db.selectFrom('users').select(['id', 'user_Id', 'password', 'role']).where('user_Id', '=', user_Id).limit(1).execute();
    const user = rows && rows[0];
    if (!user) {
        const e = new Error('invalid credentials');
        e.status = 401;
        throw e;
    }
    const ok = await bcrypt_1.default.compare(password, user.password);
    if (!ok) {
        const e = new Error('invalid credentials');
        e.status = 401;
        throw e;
    }
    const secret = process.env.JWT_SECRET || 'change_me_jwt_secret';
    const token = jsonwebtoken_1.default.sign({ id: user.id, user_Id: user.user_Id, role: user.role }, secret, { expiresIn: '1d' });
    return { token, user: { id: user.id, user_Id: user.user_Id, role: user.role } };
}
