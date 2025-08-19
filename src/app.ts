import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import pinoHttp from "pino-http";
import { perUserRateLimiter } from "@middleware/rateLimit";
import authRoutes from "@routes/auth.routes";
import deviceRoutes from "@routes/device.routes";
import logRoutes from "@routes/log.routes";
import { errorHandler, notFound } from "@middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(morgan("dev"));
app.use(pinoHttp());
app.use(perUserRateLimiter);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/devices", deviceRoutes);
app.use("/devices", logRoutes); // shares prefix

app.use(notFound);
app.use(errorHandler);

export default app;
