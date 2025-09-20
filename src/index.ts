import dotenv from "dotenv";

import { logger } from "./utils/logger";
import config from "./config";
import { createApp } from "./app";

dotenv.config();

(async () => {
    try {
        logger.info("Starting API server...");
        logger.info(`System information:`, {
            nodeVersion: process.version,
            platform: process.platform,
            environment: config.server.nodeEnv,
            timestamp: new Date().toISOString()
        });

        logger.info("Initializing database connection...");
        logger.info("Database connected succesfully.");
        
        logger.info("Configuring Express application...");
        const app = createApp();

        const server = app.listen(config.server.port, config.server.host, () => {
            logger.info("API server succesfully started and is ready to serve requests.");
            logger.info(`Server URL: http://${config.server.host}:${config.server.port}`);
        });

        const gracefulShutdown = (signal: string) => {
            logger.info(`Received ${signal}. Starting graceful shutdown...`);

            server.close(() => {
                logger.info("HTTP server closed.");
                process.exit(0);
            });
        }

        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));

        process.on("uncaughtException", (err) => {
            logger.error("Uncaught exception:", {
                error: err.message,
                stack: err.stack
            });

            gracefulShutdown("uncaughtException");
        });

        process.on("unhandledRejection", (reason, promise) => {
            logger.error("Unhandled rejection:", { reason, promise });
            gracefulShutdown("uncaughtException");
        });
    } catch (err) {
        logger.error("Failed to start server", {
            error: err instanceof Error ? err.message : String(err)
        });
        process.exit(1);
    }
})();