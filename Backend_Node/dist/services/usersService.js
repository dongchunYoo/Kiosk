"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.createUser = createUser;
exports.findByUserId = findByUserId;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const kysely_setup_1 = require("../config/kysely-setup");
const dbHelpers_1 = require("../utils/dbHelpers");
const memory = [];
let nextId = 1;
async function listUsers() {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const rows = await db.selectFrom('users').select(['id', 'user_Id', 'name', 'role']).limit(100).execute();
        return rows;
    }
    catch (err) {
        return memory.slice();
    }
}
async function createUser(user_Id, name, role) {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const res = await db.insertInto('users').values({ user_Id, name: name || '', role: role || 'A' }).execute();
        const insertId = (0, dbHelpers_1.extractInsertId)(res) || nextId++;
        return { id: insertId, user_Id, name: name || '', role: role || 'A' };
    }
    catch (err) {
        const u = { id: nextId++, user_Id, name: name || '', role: role || 'A' };
        memory.push(u);
        return u;
    }
}
async function findByUserId(user_Id) {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const rows = await db.selectFrom('users').selectAll().where('user_Id', '=', user_Id).limit(1).execute();
        if (rows && rows.length)
            return rows[0];
        return null;
    }
    catch (err) {
        return memory.find((m) => m.user_Id === user_Id) || null;
    }
}
async function updateUser(id, patch) {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        await db.updateTable('users').set(patch).where('id', '=', Number(id)).execute();
        return { id: Number(id), ...patch };
    }
    catch (err) {
        const idx = memory.findIndex(m => String(m.id) === String(id));
        if (idx >= 0) {
            memory[idx] = { ...memory[idx], ...patch };
            return memory[idx];
        }
        return null;
    }
}
async function deleteUser(id) {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        await db.deleteFrom('users').where('id', '=', Number(id)).execute();
        return true;
    }
    catch (err) {
        const before = memory.length;
        for (let i = memory.length - 1; i >= 0; i--) {
            if (String(memory[i].id) === String(id))
                memory.splice(i, 1);
        }
        return memory.length < before;
    }
}
exports.default = { listUsers, createUser, findByUserId };
