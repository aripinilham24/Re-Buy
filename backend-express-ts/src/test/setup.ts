process.env.NODE_ENV = "test";
process.env.MONGODB_URL ??= "mongodb://127.0.0.1:27017/rebuy-test";
process.env.ACCESS_TOKEN_SECRET ??= "test-access-token-secret-123456";
process.env.REFRESH_TOKEN_SECRET ??= "test-refresh-token-secret-123456";
process.env.ORIGIN ??= "http://localhost:3000";
process.env.LOG_LEVEL ??= "silent";
