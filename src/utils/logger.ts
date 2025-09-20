import fs from "fs";
import path from "path";

import config from "../config";

export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}

class Logger {
    private static instance: Logger;
    private logsFile: string;
    private logsErrorFile: string;
    private logsSecurityFile: string;

    private constructor() {
        const logsDir = path.join(process.cwd(), "logs");
        const today = new Date().toISOString().split("T")[0];

        this.logsFile = path.join(logsDir, `${today}.log`);
        this.logsErrorFile = path.join(logsDir, `${today}-error.log`);
        this.logsSecurityFile = path.join(logsDir, `${today}-security.log`);

        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    }

    public static getInstance(): Logger {
        if (!Logger.instance) Logger.instance = new Logger();
        
        return Logger.instance;
    }

    private formatMessage(level: LogLevel, message: string, meta?: any): string {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';

        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    }

    private writeToFile(level: LogLevel, formattedMessage: string): void {
        try {
            fs.appendFileSync(this.logsFile, formattedMessage + "\n");

            if (level === LogLevel.ERROR) fs.appendFileSync(this.logsErrorFile, formattedMessage + "\n");
        } catch (error) {
            console.error("Failed to write to log file:", error);
        }
    }

    private writeToSecurityFile(formattedMessage: string): void {
        try {
            fs.appendFileSync(this.logsSecurityFile, formattedMessage + "\n");
        } catch (error) {
            console.error("Failed to write to log file:", error);
        }
    }

    public debug(message: string, meta?: any): void {
        if (config.server.nodeEnv === "development") {
            const formatted = this.formatMessage(LogLevel.DEBUG, message, meta);
            console.debug(formatted);
            this.writeToFile(LogLevel.DEBUG, formatted);
        }
    }

    public info(message: string, meta?: any): void {
        const formatted = this.formatMessage(LogLevel.INFO, message, meta);
        console.log(formatted);
        this.writeToFile(LogLevel.INFO, formatted);
    }
    
    public warn(message: string, meta?: any): void {
        const formatted = this.formatMessage(LogLevel.WARN, message, meta);
        console.warn(formatted);
        this.writeToFile(LogLevel.WARN, formatted);
    }

    public error(message: string, meta?: any): void {
        const formatted = this.formatMessage(LogLevel.ERROR, message, meta);
        console.error(formatted);
        this.writeToFile(LogLevel.ERROR, formatted);
    }

    // Legacy method compatibility
    public logError(error: Error, meta?: any): void {
        this.error(error.message, { ...meta, stack: error.stack });
    }

    public logSecurityEvent(event: string, details?: any): void {
        const formatted = this.formatMessage(LogLevel.WARN, `Security event: ${event}`, details);
        console.warn(formatted);
        this.writeToFile(LogLevel.WARN, formatted);
        this.writeToSecurityFile(formatted);
    }

    public logPerformance(operation: string, duration: number, details?: any): void {
        const message = `Performance: ${operation} took ${duration}ms`;
        this.debug(message, details);
    }
}

export const logger = Logger.getInstance();