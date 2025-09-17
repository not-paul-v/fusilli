/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "kochbuch",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "cloudflare",
      providers: { cloudflare: true },
    };
  },
  async run() {
    const { db } = await import("./infra/db");
    const { scraper } = await import("./infra/scraper");
    const { recipeExtraction } = await import("./infra/recipe-extraction");
    const { api } = await import("./infra/api");

    await import("./infra/static-site");

    return {
      extractionUrl: recipeExtraction.url,
      scraperUrl: scraper.url,
      api: api.url,
    };
  },
});
