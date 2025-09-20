import express from "express";

import healthController from "../controllers/healthController";

const router = express.Router();

router.get("/health", async (req: express.Request, res: express.Response) => {
    (await healthController.healthCheck()).send(res);
});

router.get("/status", async (req: express.Request, res: express.Response) => {
    (await healthController.systemStatus()).send(res);
});

router.get("/metrics", async (req: express.Request, res: express.Response) => {
    (await healthController.performanceMetrics()).send(res);
});

export default router;