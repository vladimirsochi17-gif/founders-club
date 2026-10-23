import { createServer } from "node:http";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { migrate } from "./db/migrate.js";
import { closePool } from "./db/pool.js";
import { seed } from "./db/seed.js";
import { fileStore } from "./lib/storage.js";

async function start() {
  await fileStore.verify();
  await migrate();
  if (config.SEED_DEMO) await seed();
  const app = createApp();
  const server = createServer(app);
  server.listen(config.PORT, "0.0.0.0", () => {
    console.info(
      `Founders Club API listening on http://localhost:${config.PORT}`,
    );
  });

  async function shutdown(signal: string) {
    console.info(`${signal}: graceful shutdown`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  }
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch(async (error) => {
  console.error("Startup failed", error);
  await closePool();
  process.exit(1);
});
