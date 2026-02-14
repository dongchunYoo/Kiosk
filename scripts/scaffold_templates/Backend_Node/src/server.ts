import express from 'express';
import { logInfo } from './utils/logger';

export async function createServer() {
	const app = express();
	app.use(express.json());

	app.get('/health', (_req, res) => {
		res.json({ ok: true });
	});

	logInfo('Server initialized');
	return app;
}
