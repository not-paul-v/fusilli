export const recipeExtraction = new sst.cloudflare.Worker("RecipeExtraction", {
  handler: "packages/functions/src/recipe-extraction.ts",
  url: true,
  environment: {
    OPENROUTER_TOKEN: process.env.OPENROUTER_TOKEN!,
  },
});
