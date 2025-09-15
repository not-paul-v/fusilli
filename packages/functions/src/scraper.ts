import { Scraper } from "@kochbuch/core/scraper";
import { Resource } from "sst";

export default {
  async fetch(req: Request, env: { RECIPE_EXTRACTION_URL: string }) {
    if (req.method == "GET") {
      const url = new URL(req.url).searchParams.get("url");
      if (!url) {
        return new Response("Missing url parameter", { status: 400 });
      }

      const { textContent } = await Scraper.scrape(url);

      const response = await Resource.RecipeExtraction.fetch(
        env.RECIPE_EXTRACTION_URL,
        {
          method: "POST",
          body: JSON.stringify({ textContent }),
          headers: { "Content-Type": "application/json" },
        },
      );

      return response;
    }

    return new Response("Method not allowed", { status: 405 });
  },
};
