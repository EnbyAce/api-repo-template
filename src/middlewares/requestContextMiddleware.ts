import express from "express";

export default (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const requestId = `Request${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    res.setHeader("X-Request-ID", requestId);
    
    res.locals.requestId = requestId;
    res.locals.context = {
        requestId,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date().toISOString()
    };

    next();
}