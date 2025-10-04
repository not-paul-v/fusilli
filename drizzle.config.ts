import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  schema: "./packages/core/src/db/schemas",
  out: "./packages/core/src/db/migrations",
  dbCredentials: {
    databaseId: Resource.DB.databaseId,
    accountId: process.env.CLOUDFLARE_DEFAULT_ACCOUNT_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
  },
});
