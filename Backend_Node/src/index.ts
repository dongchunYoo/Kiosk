import 'dotenv/config';
import { createServer } from './server';
import { logInfo, logError } from './utils/logger';

const port = process.env.PORT || 3000;

async function main() {
  const app = await createServer();
  app.listen(port, () => {
    logInfo(`Backend_Node listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  logError('Failed to start server', err);
  process.exit(1);
});
