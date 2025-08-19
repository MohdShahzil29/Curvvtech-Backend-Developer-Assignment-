import { Router } from "express";
import * as DeviceController from "@controllers/device.controller.ts";
import { validate } from "@middleware/validate.ts";
import { auth } from "@middleware/auth.ts";
import {
  createDeviceSchema,
  listDevicesSchema,
  updateDeviceSchema,
  deviceIdParamSchema,
  heartbeatSchema,
} from "../schemas/device.schema.ts";

const router = Router();

router.use(auth);

router.post("/", validate(createDeviceSchema), DeviceController.create);
router.get("/", validate(listDevicesSchema), DeviceController.list);
router.patch("/:id", validate(updateDeviceSchema), DeviceController.update);
router.delete("/:id", validate(deviceIdParamSchema), DeviceController.remove);
router.post(
  "/:id/heartbeat",
  validate(heartbeatSchema),
  DeviceController.heartbeat
);

export default router;
