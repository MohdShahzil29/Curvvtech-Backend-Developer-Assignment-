import { Log } from "@models/Log";
import { Types } from "mongoose";
import dayjs from "dayjs";

export async function createLog(
  ownerId: string,
  deviceId: string,
  payload: { event: string; value?: number; timestamp?: string }
) {
  // Ownership should be enforced at route/service level by verifying device owner, but for brevity assume checked in controller.
  const time = payload.timestamp ? new Date(payload.timestamp) : new Date();
  return Log.create({
    device_id: new Types.ObjectId(deviceId),
    event: payload.event,
    value: payload.value,
    timestamp: time,
  });
}

export async function getLogs(deviceId: string, limit: number) {
  return Log.find({ device_id: deviceId }).sort({ timestamp: -1 }).limit(limit);
}

export async function getUsage(deviceId: string, range: "24h" | "7d") {
  const now = dayjs();
  const from =
    range === "24h" ? now.subtract(24, "hour") : now.subtract(7, "day");
  const result = await Log.aggregate([
    {
      $match: {
        device_id: new Types.ObjectId(deviceId),
        event: "units_consumed",
        timestamp: { $gte: from.toDate(), $lte: now.toDate() },
      },
    },
    { $group: { _id: null, total: { $sum: { $ifNull: ["$value", 0] } } } },
  ]);
  const total = result[0]?.total || 0;
  return total as number;
}
