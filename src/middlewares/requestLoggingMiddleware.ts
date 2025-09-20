import express from "express";

import { logger } from "../utils/logger";

export default (req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.info("Incoming request:", Object.assign({
        contentType: req.get("Content-Type"),
        contentLength: req.get("Content-Length"),
        body: Object.keys(req.body || {}).length ? req.body : undefined,
        params: Object.keys(req.params || {}).length ? req.params : undefined,
        query: Object.keys(req.query || {}).length ? req.query : undefined
    }, res.locals.context));

    next();
}