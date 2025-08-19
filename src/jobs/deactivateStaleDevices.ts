import cron from "node-cron";
import { Device } from "@models/Device";

// Runs every 30 minutes. Deactivates devices inactive for >24h.
export function startStaleDeviceJob() {
  cron.schedule("*/30 * * * *", async () => {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await Device.updateMany(
      { last_active_at: { $lte: dayAgo } },
      { $set: { status: "inactive" } }
    );
  });
}
