import { Router } from "express";
import * as LogController from "@controllers/log.controller.ts";
import { validate } from "@middleware/validate.ts";
import { auth } from "@middleware/auth.ts";
import {
  createLogSchema,
  getLogsSchema,
  usageSchema,
} from "../schemas/log.schema.ts";

const router = Router();

router.use(auth);
router.post("/:id/logs", validate(createLogSchema), LogController.create);
router.get("/:id/logs", validate(getLogsSchema), LogController.list);
router.get("/:id/usage", validate(usageSchema), LogController.usage);

export default router;
