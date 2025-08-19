import { env } from "@config/env";
import { connectDB } from "@config/db";
import app from "./app";
import { startStaleDeviceJob } from "@jobs/deactivateStaleDevices";

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
