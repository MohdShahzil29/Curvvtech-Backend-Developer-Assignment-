import { Response } from "express";
import { AuthRequest } from "@middleware/auth";
import * as Logs from "@services/log.service";
import { StatusCodes } from "http-status-codes";
import { assertOwnership } from "@controllers/device.controller";

export async function create(req: AuthRequest, res: Response) {
  await assertOwnership(req.user!.id, req.params.id);
  const log = await Logs.createLog(req.user!.id, req.params.id, req.body);
  return res.status(StatusCodes.CREATED).json({ success: true, log });
}

export async function list(req: AuthRequest, res: Response) {
  await assertOwnership(req.user!.id, req.params.id);
  const limit = Number(req.query.limit || 10);
  const logs = await Logs.getLogs(req.params.id, limit);
  return res.status(StatusCodes.OK).json({ success: true, logs });
}

export async function usage(req: AuthRequest, res: Response) {
  await assertOwnership(req.user!.id, req.params.id);
  const range = (req.query.range as "24h" | "7d") || "24h";
  const total = await Logs.getUsage(req.params.id, range);
  return res
    .status(StatusCodes.OK)
    .json({
      success: true,
      device_id: req.params.id,
      total_units_last_24h: range === "24h" ? total : undefined,
      total_units_last_7d: range === "7d" ? total : undefined,
    });
}
