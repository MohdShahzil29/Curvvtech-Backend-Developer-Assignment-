import "dotenv/config";

export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/curvvtech",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  RATE_LIMIT_PER_MIN: process.env.RATE_LIMIT_PER_MIN
    ? Number(process.env.RATE_LIMIT_PER_MIN)
    : 100,
};
