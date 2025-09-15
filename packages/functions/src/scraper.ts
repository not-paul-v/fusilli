import { Scraper } from "@kochbuch/core/scraper";

export default {
  async fetch(req: Request) {
    if (req.method == "GET") {
      const url = new URL(req.url).searchParams.get("url");
      if (!url) {
        return new Response("Missing url parameter", { status: 400 });
      }

      const result = await Scraper.scrape(url);
      return Response.json(result);
    }

    return new Response("Method not allowed", { status: 405 });
  },
};
