import express from "express";
import path from "path";
import fs from "fs";

import { logger } from "../utils/logger";
import ResponseData from "../utils/responseData";
import config from "../config";

export default {
    healthCheck: async () => {
        try {
            return new ResponseData(
                {
                    status: "healthy",
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    environment: process.env.NODE_ENV || "development"
                },
                200
            );
        } catch (err) {
            logger.error("Health check failed:", err instanceof Error ? {
                error: err.message
            } : undefined);

            return new ResponseData(
                {
                    status: "unhealthy",
                    timestamp: new Date().toISOString(),
                    error: "Health check failed."
                },
                500
            );
        }
    },

    systemStatus: async () => {
        try {
            const startTime = Date.now();

            // File system checks
            const uploadPath = path.join(process.cwd(), "upload");
            let fileSystemStatus = "unknown";
            let uploadContents: string[] = [];

            try {
                uploadContents = fs.readdirSync(uploadPath);
                fileSystemStatus = "healthy";
            } catch (err) {
                logger.error("File system health check failed", err instanceof Error ? {
                    error: err.message
                } : undefined);
                fileSystemStatus = "unhealthy";
            }

            // Log directory check
            const logsPath = path.join(process.cwd(), "logs");
            let logsStatus = "unknown";
            let logFiles: string[] = [];

            try {
                const logDirFiles = fs.readdirSync(logsPath).filter((file) => file.endsWith(".log"));
                logsStatus = "healthy";
            } catch (err) {
                logger.error("Logs check failed", err instanceof Error ? {
                    error: err.message
                } : undefined);
                logsStatus = "unhealthy";
            }

            // Memory usage
            const memoryUsage = process.memoryUsage();
            const memoryInfo = {
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
                external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
                rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100
            };

            const totalResponseTime = Date.now() - startTime;

            const systemStatus = {
                status: (fileSystemStatus == "healthy" && logsStatus == "healthy") ? "healthy" : "degraded",
                timestamp: new Date().toISOString(),
                responseTime: totalResponseTime,
                services: {
                    uploads: {
                        status: fileSystemStatus,
                        uploadPath,
                        contents: uploadContents.length
                    },
                    logging: {
                        status: logsStatus,
                        logFiles: logFiles.length,
                        recentLogs: logFiles.slice(-5)
                    }
                },
                system: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    uptime: Math.round(process.uptime()),
                    environment: config.server.nodeEnv,
                    memory: memoryInfo,
                    pid: process.pid
                }
            };

            return new ResponseData(systemStatus, systemStatus.status == "healthy" ? 200 : 500);
        } catch (err) {
            logger.error("System status check failed", err instanceof Error ? {
                error: err.message
            } : undefined);
            
            return new ResponseData(
                {
                    status: "error",
                    timestamp: new Date().toISOString(),
                    error: "System status check failed",
                    message: err instanceof Error ? err.message : undefined
                },
                500
            );
        }
    },

    performanceMetrics: async () => {
        try {
            const memoryUsage = process.memoryUsage();

            const metrics = {
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: {
                    used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
                    total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
                    percentage: Math.round(memoryUsage.heapUsed / memoryUsage.heapTotal * 1000) / 10
                },
                cpu: {
                    usage: process.cpuUsage()
                },
                environment: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    arch: process.arch,
                    pid: process.pid
                }
            };

            return new ResponseData(metrics, 200);
        } catch (err) {
            logger.error("Performance metrics failed", err instanceof Error ? {
                error: err.message
            } : undefined);
            
            return new ResponseData(
                {
                    status: "error",
                    message: "Performance metrics failed",
                    error: err instanceof Error ? err.message : undefined
                },
                500
            )
        }
    }
}