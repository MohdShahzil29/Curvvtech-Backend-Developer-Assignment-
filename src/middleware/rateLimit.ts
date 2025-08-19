import rateLimit from "express-rate-limit";
import { env } from "@config/env.ts";
import type { Request } from "express";

export const perUserRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.RATE_LIMIT_PER_MIN,
  keyGenerator: (req: Request) => {
    const auth = req.headers.authorization;
    const tokenPart = auth?.startsWith("Bearer ") ? auth.slice(7, 20) : "anon";
    const ip = req.ip || "0.0.0.0";
    return `${tokenPart}-${ip}`; // pseudo user-scoped limiter
  },
  standardHeaders: true,
  legacyHeaders: false,
});
