import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({
  path: "../../apps/server/.env",
});

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  // DOCS: https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit
  dialect: "sqlite",
  ...(process.env.LOCAL !== "false"
    ? {
        dbCredentials: {
          // TODO: don't hardcode path
          url: "../../.alchemy/miniflare/v3/d1/miniflare-D1DatabaseObject/c81f4696eaa520deeb75f0a3028a2eeb73e0ff18a83f1f8b35ef32330c8d2c03.sqlite",
        },
      }
    : {
        driver: "d1-http",
      }),
});
