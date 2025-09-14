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

    await import("./infra/static-site");

    return {
      scraperUrl: scraper.url,
    };
  },
});
