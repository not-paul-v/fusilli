import { recipeExtraction } from "./recipe-extraction";
import { scraper } from "./scraper";

export const api = new sst.cloudflare.Worker("Api", {
  handler: "packages/functions/src/api.ts",
  environment: {
    OPENROUTER_TOKEN: process.env.OPENROUTER_TOKEN!,
  },
  url: true,
});
