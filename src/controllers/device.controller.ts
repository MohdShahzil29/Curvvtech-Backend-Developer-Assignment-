import { Response } from "express";
import * as Dev from "@services/device.service";
import { AuthRequest } from "@middleware/auth";
import { StatusCodes } from "http-status-codes";
import { Device } from "@models/Device";

export async function create(req: AuthRequest, res: Response) {
  const device = await Dev.createDevice(req.user!.id, req.body);
  return res.status(StatusCodes.CREATED).json({ success: true, device });
}

export async function list(req: AuthRequest, res: Response) {
  const devices = await Dev.listDevices(req.user!.id, {
    type: req.query.type as string | undefined,
    status: req.query.status as string | undefined,
  });
  return res.status(StatusCodes.OK).json({ success: true, devices });
}

export async function update(req: AuthRequest, res: Response) {
  const device = await Dev.updateDevice(req.user!.id, req.params.id, req.body);
  return res.status(StatusCodes.OK).json({ success: true, device });
}

export async function remove(req: AuthRequest, res: Response) {
  await Dev.deleteDevice(req.user!.id, req.params.id);
  return res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Device removed" });
}

export async function heartbeat(req: AuthRequest, res: Response) {
  const device = await Dev.heartbeat(
    req.user!.id,
    req.params.id,
    req.body.status
  );
  return res
    .status(StatusCodes.OK)
    .json({
      success: true,
      message: "Device heartbeat recorded",
      last_active_at: device.last_active_at,
    });
}

export async function assertOwnership(userId: string, deviceId: string) {
  const owned = await Device.findOne({
    _id: deviceId,
    owner_id: userId,
  }).lean();
  if (!owned)
    throw Object.assign(new Error("Device not found"), { status: 404 });
}
