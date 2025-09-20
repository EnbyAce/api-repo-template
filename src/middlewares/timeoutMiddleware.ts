import express from "express";

import config from "../config";
import { logger } from "../utils/logger";

export default (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const timeout = setTimeout(() => {
        logger.logError(new Error("Request timeout"), res.locals.context);

        res.status(408).send({
            success: false,
            error: "Request timeout",
            message: "The request took too long to process."
        })
    }, config.express.requestTimeout);

    res.on("finish", () => {
        clearTimeout(timeout);
    });

    next();
}