# Backend_Node (TypeScript scaffold)

This is a refactored backend scaffold for the Kiosk project. It is TypeScript-based and intended to be a migration target for the existing `backend-node` project.

## Quick start

### Using run.dev.sh (Recommended)
```bash
./run.dev.sh
```

This script will:
1. Clean previous builds
2. Install dependencies
3. Build TypeScript
4. Check Redis server (auto-start if needed)
5. Run the server with logging to `dev.log`

### Manual start
1. Copy `.env.example` to `.env` and update values (PORT is required).
2. Install dependencies: `npm install` in `Backend_Node`.
3. Start development server: `npm run dev`.

## Environment Configuration

### Required .env variables:
- `PORT`: Server port (mandatory, no default)
- `REDIS_PREFIX`: Redis key prefix (should match root folder name: `Kiosk`)
- `MYSQL_*`: Database connection settings
- `JWT_SECRET`: JWT token secret

**Note**: PORT must be manually set in `.env`. No hardcoding or auto-generation allowed.

## Database
 - The project uses the MySQL schema in `Docs/dev_db.sql`. Apply it to your local MySQL
   instance to create the expected schema/data before running the server.

## Kysely (migrated)
 - Services have been migrated to use Kysely with a shared callback pool.
 - `src/config/kysely-setup.ts` exposes `getKysely()` which returns a cached Kysely instance typed with `src/types/db.ts` (`DbTypes`).
 - For legacy code that expects a promise-style mysql2 pool, use `getPool()` from `src/config/db.ts`.

## Logging
 - All logs use centralized logger: `src/utils/logger.ts`
 - Format: `[Backend][LEVEL][HH:MM:SS] message`
 - Levels: INFO (blue), DEBUG (green), ERROR (red)
 - Logs written to `dev.log`
 - Monitor: `tail -f dev.log`

## Redis
 - Redis server must be running before starting the backend
 - `run.dev.sh` automatically checks and starts Redis if needed
 - Key prefix: `Kiosk:<domain>:<key>` (from `REDIS_PREFIX` in `.env`)

This scaffold includes a minimal `auth` route and examples for DB connection using `mysql2`.
