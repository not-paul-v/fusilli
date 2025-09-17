import { recipeExtraction } from "./recipe-extraction";
import { scraper } from "./scraper";

export const api = new sst.cloudflare.Worker("Api", {
  handler: "packages/functions/src/api.ts",
  link: [scraper, recipeExtraction],
  environment: {
    SCRAPER_URL: scraper.url,
    RECIPE_EXTRACTION_URL: recipeExtraction.url,
  },
  url: true,
});
