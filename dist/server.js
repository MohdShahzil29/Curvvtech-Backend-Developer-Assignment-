// src/config/env.ts
import "dotenv/config";
var env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4e3,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/curvvtech",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  RATE_LIMIT_PER_MIN: process.env.RATE_LIMIT_PER_MIN ? Number(process.env.RATE_LIMIT_PER_MIN) : 100
};

// src/config/db.ts
import mongoose from "mongoose";
var connectDB = async () => {
  await mongoose.connect(env.MONGO_URI);
};

// src/app.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import pinoHttp from "pino-http";

// src/middleware/rateLimit.ts
import rateLimit from "express-rate-limit";
var perUserRateLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: env.RATE_LIMIT_PER_MIN,
  keyGenerator: (req) => {
    const auth2 = req.headers.authorization;
    const tokenPart = auth2?.startsWith("Bearer ") ? auth2.slice(7, 20) : "anon";
    const ip = req.ip || "0.0.0.0";
    return `${tokenPart}-${ip}`;
  },
  standardHeaders: true,
  legacyHeaders: false
});

// src/routes/auth.routes.ts
import { Router } from "express";

// src/models/User.ts
import { Schema, model } from "mongoose";
var userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true }
);
var User = model("User", userSchema);

// src/services/auth.service.ts
import bcrypt from "bcryptjs";

// src/config/jwt.ts
import jwt from "jsonwebtoken";
var signJwt = (payload) => {
  const secret = env.JWT_SECRET || "testsecret";
  const expiresIn = env.JWT_EXPIRES_IN || "1h";
  return jwt.sign(payload, secret, { expiresIn });
};
var verifyJwt = (token) => {
  const secret = env.JWT_SECRET || "testsecret";
  return jwt.verify(token, secret);
};

// src/services/auth.service.ts
async function signup(name, email, password, role = "user") {
  const existing = await User.findOne({ email });
  if (existing)
    throw Object.assign(new Error("Email already registered"), { status: 409 });
  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hash, role });
  return { success: true, message: "User registered successfully" };
}
async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user)
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok)
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const token = signJwt({ sub: user.id, role: user.role });
  return {
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
}

// src/controllers/auth.controller.ts
import { StatusCodes } from "http-status-codes";
async function signup2(req, res) {
  const { name, email, password, role } = req.body;
  const out = await signup(name, email, password, role);
  return res.status(StatusCodes.CREATED).json(out);
}
async function login2(req, res) {
  const { email, password } = req.body;
  const out = await login(email, password);
  return res.status(StatusCodes.OK).json(out);
}

// src/middleware/validate.ts
import { StatusCodes as StatusCodes2 } from "http-status-codes";
var validate = (schema) => (req, res, next) => {
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    return next();
  } catch (err) {
    const zerr = err;
    return res.status(StatusCodes2.BAD_REQUEST).json({ success: false, errors: zerr.flatten() });
  }
};

// src/schemas/auth.schema.ts
import { z } from "zod";
var signupSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["user", "admin"]).optional().default("user")
  })
});
var loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

// src/routes/auth.routes.ts
var router = Router();
router.post("/signup", validate(signupSchema), signup2);
router.post("/login", validate(loginSchema), login2);
var auth_routes_default = router;

// src/routes/device.routes.ts
import { Router as Router2 } from "express";

// src/models/Device.ts
import { Schema as Schema2, model as model2 } from "mongoose";
var deviceSchema = new Schema2(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["light", "thermostat", "meter", "camera", "other"],
      default: "other"
    },
    status: {
      type: String,
      enum: ["active", "inactive", "faulty"],
      default: "inactive"
    },
    last_active_at: { type: Date, default: null },
    owner_id: {
      type: Schema2.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);
var Device = model2("Device", deviceSchema);

// src/services/device.service.ts
import { Types as Types2 } from "mongoose";
async function createDevice(ownerId, data) {
  const device = await Device.create({
    ...data,
    owner_id: new Types2.ObjectId(ownerId)
  });
  return device;
}
async function listDevices(ownerId, filter) {
  const q = { owner_id: new Types2.ObjectId(ownerId) };
  if (filter.type) q.type = filter.type;
  if (filter.status) q.status = filter.status;
  return Device.find(q).sort({ createdAt: -1 });
}
async function updateDevice(ownerId, id, patch) {
  const device = await Device.findOneAndUpdate(
    { _id: id, owner_id: ownerId },
    patch,
    { new: true }
  );
  if (!device)
    throw Object.assign(new Error("Device not found"), { status: 404 });
  return device;
}
async function deleteDevice(ownerId, id) {
  const res = await Device.findOneAndDelete({ _id: id, owner_id: ownerId });
  if (!res) throw Object.assign(new Error("Device not found"), { status: 404 });
  return { success: true };
}
async function heartbeat(ownerId, id, status) {
  const update2 = { last_active_at: /* @__PURE__ */ new Date() };
  if (status) update2.status = status;
  const device = await Device.findOneAndUpdate(
    { _id: id, owner_id: ownerId },
    update2,
    { new: true }
  );
  if (!device)
    throw Object.assign(new Error("Device not found"), { status: 404 });
  return device;
}

// src/controllers/device.controller.ts
import { StatusCodes as StatusCodes3 } from "http-status-codes";
async function create(req, res) {
  const device = await createDevice(req.user.id, req.body);
  return res.status(StatusCodes3.CREATED).json({ success: true, device });
}
async function list(req, res) {
  const devices = await listDevices(req.user.id, {
    type: req.query.type,
    status: req.query.status
  });
  return res.status(StatusCodes3.OK).json({ success: true, devices });
}
async function update(req, res) {
  const device = await updateDevice(req.user.id, req.params.id, req.body);
  return res.status(StatusCodes3.OK).json({ success: true, device });
}
async function remove(req, res) {
  await deleteDevice(req.user.id, req.params.id);
  return res.status(StatusCodes3.OK).json({ success: true, message: "Device removed" });
}
async function heartbeat2(req, res) {
  const device = await heartbeat(
    req.user.id,
    req.params.id,
    req.body.status
  );
  return res.status(StatusCodes3.OK).json({
    success: true,
    message: "Device heartbeat recorded",
    last_active_at: device.last_active_at
  });
}
async function assertOwnership(userId, deviceId) {
  const owned = await Device.findOne({
    _id: deviceId,
    owner_id: userId
  }).lean();
  if (!owned)
    throw Object.assign(new Error("Device not found"), { status: 404 });
}

// src/middleware/auth.ts
import { StatusCodes as StatusCodes4 } from "http-status-codes";
var auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(StatusCodes4.UNAUTHORIZED).json({ success: false, message: "Missing token" });
  }
  try {
    const token = header.split(" ")[1];
    const payload = verifyJwt(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (e) {
    return res.status(StatusCodes4.UNAUTHORIZED).json({ success: false, message: "Invalid/Expired token" });
  }
};

// src/schemas/device.schema.ts
import { z as z2 } from "zod";
var createDeviceSchema = z2.object({
  body: z2.object({
    name: z2.string().min(2),
    type: z2.enum(["light", "thermostat", "meter", "camera", "other"]).default("other"),
    status: z2.enum(["active", "inactive", "faulty"]).optional().default("inactive")
  })
});
var listDevicesSchema = z2.object({
  query: z2.object({
    type: z2.enum(["light", "thermostat", "meter", "camera", "other"]).optional(),
    status: z2.enum(["active", "inactive", "faulty"]).optional()
  })
});
var updateDeviceSchema = z2.object({
  params: z2.object({ id: z2.string().length(24) }),
  body: z2.object({
    name: z2.string().min(2).optional(),
    type: z2.enum(["light", "thermostat", "meter", "camera", "other"]).optional(),
    status: z2.enum(["active", "inactive", "faulty"]).optional()
  }).refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update"
  })
});
var deviceIdParamSchema = z2.object({
  params: z2.object({ id: z2.string().length(24) })
});
var heartbeatSchema = z2.object({
  params: z2.object({ id: z2.string().length(24) }),
  body: z2.object({
    status: z2.enum(["active", "inactive", "faulty"]).optional()
  })
});

// src/routes/device.routes.ts
var router2 = Router2();
router2.use(auth);
router2.post("/", validate(createDeviceSchema), create);
router2.get("/", validate(listDevicesSchema), list);
router2.patch("/:id", validate(updateDeviceSchema), update);
router2.delete("/:id", validate(deviceIdParamSchema), remove);
router2.post(
  "/:id/heartbeat",
  validate(heartbeatSchema),
  heartbeat2
);
var device_routes_default = router2;

// src/routes/log.routes.ts
import { Router as Router3 } from "express";

// src/models/Log.ts
import { Schema as Schema3, model as model3 } from "mongoose";
var logSchema = new Schema3(
  {
    device_id: {
      type: Schema3.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true
    },
    event: { type: String, required: true },
    value: { type: Number, required: false },
    timestamp: { type: Date, default: () => /* @__PURE__ */ new Date(), index: true }
  },
  { timestamps: true }
);
var Log = model3("Log", logSchema);

// src/services/log.service.ts
import { Types as Types4 } from "mongoose";
import dayjs from "dayjs";
async function createLog(ownerId, deviceId, payload) {
  const time = payload.timestamp ? new Date(payload.timestamp) : /* @__PURE__ */ new Date();
  return Log.create({
    device_id: new Types4.ObjectId(deviceId),
    event: payload.event,
    value: payload.value,
    timestamp: time
  });
}
async function getLogs(deviceId, limit) {
  return Log.find({ device_id: deviceId }).sort({ timestamp: -1 }).limit(limit);
}
async function getUsage(deviceId, range) {
  const now = dayjs();
  const from = range === "24h" ? now.subtract(24, "hour") : now.subtract(7, "day");
  const result = await Log.aggregate([
    {
      $match: {
        device_id: new Types4.ObjectId(deviceId),
        event: "units_consumed",
        timestamp: { $gte: from.toDate(), $lte: now.toDate() }
      }
    },
    { $group: { _id: null, total: { $sum: { $ifNull: ["$value", 0] } } } }
  ]);
  const total = result[0]?.total || 0;
  return total;
}

// src/controllers/log.controller.ts
import { StatusCodes as StatusCodes5 } from "http-status-codes";
async function create2(req, res) {
  await assertOwnership(req.user.id, req.params.id);
  const log = await createLog(req.user.id, req.params.id, req.body);
  return res.status(StatusCodes5.CREATED).json({ success: true, log });
}
async function list2(req, res) {
  await assertOwnership(req.user.id, req.params.id);
  const limit = Number(req.query.limit || 10);
  const logs = await getLogs(req.params.id, limit);
  return res.status(StatusCodes5.OK).json({ success: true, logs });
}
async function usage(req, res) {
  await assertOwnership(req.user.id, req.params.id);
  const range = req.query.range || "24h";
  const total = await getUsage(req.params.id, range);
  return res.status(StatusCodes5.OK).json({
    success: true,
    device_id: req.params.id,
    total_units_last_24h: range === "24h" ? total : void 0,
    total_units_last_7d: range === "7d" ? total : void 0
  });
}

// src/schemas/log.schema.ts
import { z as z3 } from "zod";
var createLogSchema = z3.object({
  params: z3.object({ id: z3.string().length(24) }),
  body: z3.object({
    event: z3.string().min(1),
    value: z3.number().optional(),
    timestamp: z3.string().datetime().optional()
  })
});
var getLogsSchema = z3.object({
  params: z3.object({ id: z3.string().length(24) }),
  query: z3.object({
    limit: z3.coerce.number().int().positive().max(100).default(10)
  })
});
var usageSchema = z3.object({
  params: z3.object({ id: z3.string().length(24) }),
  query: z3.object({
    range: z3.enum(["24h", "7d"]).default("24h")
  })
});

// src/routes/log.routes.ts
var router3 = Router3();
router3.use(auth);
router3.post("/:id/logs", validate(createLogSchema), create2);
router3.get("/:id/logs", validate(getLogsSchema), list2);
router3.get("/:id/usage", validate(usageSchema), usage);
var log_routes_default = router3;

// src/middleware/errorHandler.ts
import { StatusCodes as StatusCodes6 } from "http-status-codes";
function notFound(_req, res) {
  return res.status(StatusCodes6.NOT_FOUND).json({ success: false, message: "Route not found" });
}
function errorHandler(err, _req, res, _next) {
  const status = err.status || StatusCodes6.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal server error";
  return res.status(status).json({ success: false, message });
}

// src/app.ts
var app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(morgan("dev"));
app.use(pinoHttp());
app.use(perUserRateLimiter);
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", auth_routes_default);
app.use("/devices", device_routes_default);
app.use("/devices", log_routes_default);
app.use(notFound);
app.use(errorHandler);
var app_default = app;

// src/jobs/deactivateStaleDevices.ts
import cron from "node-cron";
function startStaleDeviceJob() {
  cron.schedule("*/30 * * * *", async () => {
    const now = /* @__PURE__ */ new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
    await Device.updateMany(
      { last_active_at: { $lte: dayAgo } },
      { $set: { status: "inactive" } }
    );
  });
}

// src/server.ts
async function bootstrap() {
  await connectDB();
  startStaleDeviceJob();
  app_default.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}
bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
//# sourceMappingURL=server.js.map