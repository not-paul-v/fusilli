export const recipeExtraction = new sst.cloudflare.Worker("RecipeExtraction", {
  handler: "packages/functions/src/recipe-extraction.ts",
  url: true,
  transform: {
    worker: (args) => {
      args.bindings = $resolve(args.bindings).apply((bindings) => [
        ...bindings,
        {
          name: "AI",
          type: "ai",
        },
      ]);
    },
  },
});
