import { Router } from "express";
import * as LogController from "@controllers/log.controller";
import { validate } from "@middleware/validate";
import { auth } from "@middleware/auth";
import {
  createLogSchema,
  getLogsSchema,
  usageSchema,
} from "../schemas/log.schema";

const router = Router();

router.use(auth);
router.post("/:id/logs", validate(createLogSchema), LogController.create);
router.get("/:id/logs", validate(getLogsSchema), LogController.list);
router.get("/:id/usage", validate(usageSchema), LogController.usage);

export default router;
