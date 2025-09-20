import compression from "compression";
import express from "express";

import config from "../config";

export default compression({
    filter: (req: express.Request, res: express.Response) => {
        if (req.headers["x-no-compression"]) return false;
        
        return compression.filter(req, res);
    },
    threshold: config.security.compressionThreshold
});