import { createServer } from "node:http";
import { createApp } from "./app.js";
import { connectDB, disconnectDB } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./common/logger.js";
import { closeSocket, initSocket } from "./socket.js";

const start = async () => {
  await connectDB();

  const app = createApp();
  const server = createServer(app);
  initSocket(server);

  server.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Shutting down");

    const forceExit = setTimeout(() => {
      logger.error("Graceful shutdown timed out");
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    closeSocket();
    server.close(async () => {
      try {
        await disconnectDB();
        process.exit(0);
      } catch (error) {
        logger.error({ error }, "Failed to disconnect cleanly");
        process.exit(1);
      }
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start().catch((error) => {
  logger.error({ error }, "Failed to start server");
  process.exit(1);
});
