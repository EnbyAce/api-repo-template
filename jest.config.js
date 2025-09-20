const { createDefaultPreset } = require("ts-jest");

const transformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
    testEnvironment: "node",
    transform: {
        ...transformCfg
    }
}