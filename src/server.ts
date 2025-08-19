import { env } from "@config/env.ts";
import { connectDB } from "@config/db.ts";
import app from "./app.ts";
import { startStaleDeviceJob } from "@jobs/deactivateStaleDevices.ts";

async function bootstrap() {
  await connectDB();
  startStaleDeviceJob();
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
