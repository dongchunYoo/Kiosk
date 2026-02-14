import 'dotenv/config';
import { createServer } from './server';
import { logError, logInfo } from './utils/logger';

const port = process.env.PORT;
if (!port) {
	throw new Error('PORT not configured in .env');
}

async function main() {
	const app = await createServer();
	app.listen(Number(port), () => {
		logInfo(`Backend_Node listening on http://localhost:${port}`);
	});
}

main().catch((err) => {
	logError('Failed to start server', err);
	process.exit(1);
});
