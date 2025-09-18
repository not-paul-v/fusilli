import { recipeExtraction } from "./recipe-extraction";
import { scraper } from "./scraper";

export const api = new sst.cloudflare.Worker("Api", {
  handler: "packages/functions/src/api.ts",
  link: [scraper, recipeExtraction],
  url: true,
});
