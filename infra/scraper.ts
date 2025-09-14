export const scraper = new sst.cloudflare.Worker("Scraper", {
  handler: "packages/functions/src/scraper.ts",
  url: true,
});
