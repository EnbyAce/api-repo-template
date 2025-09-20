import express from "express";
import { logger } from "../utils/logger";

const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /union.*select/i, // SQL injection 1
    /select.*from/i, // SQL injection 2
    /drop.*table/i, // SQL injection 3
    /delete.*from/i, // SQL injection 4
    /insert.*into/i, // SQL injection 5
    /update.*set/i, // SQL injection 6
    /;--/, // SQL injection 7
    /javascript:/i, // JavaScript injection
    /on\w+\s*=/i // Event handler injection
];

export default (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const suspiciousContent = [req.originalUrl, JSON.stringify(req.body), JSON.stringify(req.params), JSON.stringify(req.query)].join(" ");
    const foundPattern = suspiciousPatterns.find((pattern) => pattern.test(suspiciousContent));

    if (foundPattern) {
        logger.logSecurityEvent("Suspicious request detected:", Object.assign({
            pattern: foundPattern.toString(),
            severity: "HIGH",
            requestBody: req.body,
            requestParams: req.params,
            requestQuery: req.query
        }, res.locals.context));
    }

    // Check for excessive request headers (potential DoS)
    const headerCount = Object.keys(req.headers).length;
    if (headerCount > 50) {
        logger.logSecurityEvent("Excessive headers detected:", Object.assign({
            severity: "MEDIUM",
            headerCount
        }, res.locals.context));
    }

    next();
}