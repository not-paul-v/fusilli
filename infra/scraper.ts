import { recipeExtraction } from "./recipe-extraction";

export const scraper = new sst.cloudflare.Worker("Scraper", {
  handler: "packages/functions/src/scraper.ts",
  link: [recipeExtraction],
  environment: {
    RECIPE_EXTRACTION_URL: recipeExtraction.url,
  },
  url: true,
});
