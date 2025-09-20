export default {
    server: {
        host: process.env.HOST || "localhost",
        port: parseInt(process.env.PORT || "3000"),
        nodeEnv: process.env.NODE_ENV || "development",
    },

    express: {
        jsonLimit: process.env.EXPRESS_JSON_LIMIT || "10mb",
        urlEncodedLimit: process.env.EXPRESS_URLENCODED_LIMIT || "10mb",
        requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || "30000"), // 30s
        slowResponseThreshold: parseInt(process.env.SLOW_RESPONSE_THRESHOLD || "1000") // 1000ms
    },

    cors: {
        whitelist: process.env.CORS_ORIGINS?.split(",") || [
            "http://localhost:3000",
            "http://localhost:3001",
            "*",
            undefined
        ]
    },

    security: {
        compressionThreshold: parseInt(process.env.SECURITY_COMPRESSION_THRESHOLD || "1024") // 1KB
    }
}