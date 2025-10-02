import { db } from "./db";

export const api = new sst.cloudflare.Worker("Api", {
  handler: "packages/functions/src/api.ts",
  link: [db],
  environment: {
    OPENROUTER_TOKEN: process.env.OPENROUTER_TOKEN!,
  },
  url: true,
});
