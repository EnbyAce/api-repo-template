import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import securityHeadersMiddleware from "./middlewares/securityHeadersMiddleware";
import compressionMiddleware from "./middlewares/compressionMiddleware";
import responseTimeMiddleware from "./middlewares/responseTimeMiddleware";
import requestContextMiddleware from "./middlewares/requestContextMiddleware";
import timeoutMiddleware from "./middlewares/timeoutMiddleware";

import securityMonitoringMiddleware from "./middlewares/securityMonitoringMiddleware";
import requestLoggingMiddleware from "./middlewares/requestLoggingMiddleware";

import healthRoutes from "./routes/healthRoutes";

import { logger } from "./utils/logger";

import config from "./config";
import api from "./api";

export const createApp = (): express.Application => {
    const app = express();

    app.use(securityHeadersMiddleware); // Sets security headers, must be first
    app.use(compressionMiddleware); // Early for performance
    app.use(requestContextMiddleware); // Add request ID and context
    app.use(responseTimeMiddleware); // Monitor the response time
    app.use(timeoutMiddleware); // Request timeout protection

    app.use(express.json({
        limit: config.express.jsonLimit
    }));

    app.use(express.urlencoded({
        extended: true,
        limit: config.express.urlEncodedLimit
    }));

    app.use(cors({
        origin: (origin, callback) => {
            if (config.cors.whitelist.includes(origin)) return callback(null, true);
            callback(new Error(`Not allowed by CORS: ${origin}`));
        },
        credentials: true,
        optionsSuccessStatus: 200
    }));

    app.use(securityMonitoringMiddleware); // Detect suspicious requests
    app.use(requestLoggingMiddleware);

    const serverDir = path.dirname(__dirname);
    const uploadPath = path.join(serverDir, "upload");

    logger.info(`Current directory: ${__dirname}`);
    logger.info(`Server directory: ${serverDir}`);
    logger.info(`Upload path: ${uploadPath}`);

    // Ensure upload directory exists
    if (!fs.existsSync(uploadPath)) {
        try {
            fs.mkdirSync(uploadPath, { recursive: true });
            logger.info(`Created upload directory: ${uploadPath}`);
        } catch (err) {
            logger.error(`Failed to create upload directory: ${err}`);
        }
    }

    // Log files in upload directory
    try {
        const files = fs.readdirSync(uploadPath);
        logger.info(`Upload directory contents (${files.length} items):`);
        
        files.forEach((file) => {
            const filePath = path.join(uploadPath, file);
            const stats = fs.statSync(filePath);
            logger.info(`- ${file} (${stats.size} bytes)`);
        });
    } catch (err) {
        logger.error(`Failed to read upload directory: ${err}`);
    }

    logger.info(`Static file server: /upload -> ${uploadPath}`);

    app.use("/upload", (req, res, next) => {
        const cleanPath = (req.path === "/" ? "" : req.path).replace(/^\/+/, "").replace(/\.\.\//g, "");
        const requestedFile = path.join(uploadPath, cleanPath);

        logger.info(`Static file request: ${req.method} ${req.originalUrl} -> ${requestedFile}`);

        if (fs.existsSync(requestedFile)) {
            const stats = fs.statSync(requestedFile);
            if (stats.isFile()) {
                logger.info(`File exists and will be served: ${requestedFile} (${stats.size} bytes)`);

                let contentType = "application/octet-stream";
                if (requestedFile.endsWith(".jpg") || requestedFile.endsWith(".jpeg")) contentType = "image/jpeg";
                else if (requestedFile.endsWith(".png")) contentType = "image/png";
                else if (requestedFile.endsWith(".gif")) contentType = "image/gif";
                else if (requestedFile.endsWith(".svg")) contentType = "image/svg";
                else if (requestedFile.endsWith(".txt")) contentType = "text/plain";

                res.setHeader("Content-Type", contentType);
                res.setHeader("Content-Length", stats.size);
                res.setHeader("Cache-Control", "no-cache");

                return fs.createReadStream(requestedFile).pipe(res);
            }
        } else {
            logger.warn(`File not found: ${requestedFile}`);
        }

        next();
    });

    app.use("/api", api);
    app.use(healthRoutes);

    app.use("*_", (req, res, next) => {
        logger.warn(`Route not found:`, res.locals.context);

        res.status(404).json({
            success: false,
            error: "Route not found."
        });

        next();
    });

    // app.use(errorContext); // Adds request context to errors
    // app.use(errorHandler); // Global error handler

    return app;
}