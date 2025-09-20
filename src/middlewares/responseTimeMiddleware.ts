import responseTime from "response-time";
import express from "express";

import config from "../config";
import { logger } from "../utils/logger";

export default responseTime(
    (req: express.Request, res: express.Response, time: number) => {
        if (time > config.express.slowResponseThreshold) logger.logPerformance("HTTP request", time, res.locals.context);
    }
)