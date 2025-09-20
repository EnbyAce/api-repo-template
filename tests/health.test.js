const jestGlobals = require("@jest/globals");

const healthController = require("../src/controllers/healthController");

jestGlobals.test("Health check must be healthy", async () => {
    const res = await healthController.default.healthCheck();
    
    jestGlobals.expect(res.status).toBe(200);
    
    jestGlobals.expect(res.data.status).toBe("healthy");
});

jestGlobals.test("System status must be healthy", async () => {
    const res = await healthController.default.systemStatus();
    
    jestGlobals.expect(res.status).toBe(200);

    jestGlobals.expect(res.data.status).toBe("healthy");
});

jestGlobals.test("Performance metrics must return logical data", async () => {
    const res = await healthController.default.performanceMetrics();

    jestGlobals.expect(res.status).toBe(200);
    
    jestGlobals.expect(res.data.uptime).toBeGreaterThanOrEqual(0);
    jestGlobals.expect(res.data.memory.used).toBeLessThanOrEqual(res.data.memory.total);
});