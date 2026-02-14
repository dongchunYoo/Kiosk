"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = getRedisClient;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
const clients = {};
function envFor(name, key) {
    if (!name || name === 'default') {
        if (key === 'URL')
            return process.env.REDIS_URL;
        if (key === 'HOST')
            return process.env.REDIS_HOST;
        if (key === 'PORT')
            return process.env.REDIS_PORT;
        return process.env.REDIS_PREFIX;
    }
    const up = name.toUpperCase();
    if (key === 'URL')
        return process.env[`REDIS_${up}_URL`];
    if (key === 'HOST')
        return process.env[`REDIS_${up}_HOST`];
    if (key === 'PORT')
        return process.env[`REDIS_${up}_PORT`];
    return process.env[`REDIS_${up}_PREFIX`];
}
function getRedisClient(name = 'default') {
    if (clients[name])
        return clients[name];
    const url = envFor(name, 'URL') || `redis://${envFor(name, 'HOST') || '127.0.0.1'}:${envFor(name, 'PORT') || '6379'}`;
    const rawPrefix = envFor(name, 'PREFIX') || (name === 'default' ? 'kiosk' : `kiosk:${name}`);
    const keyPrefix = rawPrefix.endsWith(':') ? rawPrefix : `${rawPrefix}:`;
    try {
        const c = new ioredis_1.default(url, { keyPrefix });
        c.on('error', (err) => {
            (0, logger_1.logError)(`[Redis:${name}] connection error`, err && err.message ? err.message : err);
        });
        clients[name] = c;
    }
    catch (e) {
        (0, logger_1.logError)(`[Redis:${name}] failed to create client`, e);
        clients[name] = null;
    }
    return clients[name];
}
