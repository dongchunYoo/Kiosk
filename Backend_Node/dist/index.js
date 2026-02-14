"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const server_1 = require("./server");
const logger_1 = require("./utils/logger");
const port = process.env.PORT || 3000;
async function main() {
    const app = await (0, server_1.createServer)();
    app.listen(port, () => {
        (0, logger_1.logInfo)(`Backend_Node listening on http://localhost:${port}`);
    });
}
main().catch((err) => {
    (0, logger_1.logError)('Failed to start server', err);
    process.exit(1);
});
