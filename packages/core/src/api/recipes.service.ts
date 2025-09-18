import { Context, Hono } from "hono";
import { Bindings } from "./types";

export async function getRecipeFromLink(
  c: Context<{ Bindings: Bindings }>,
  url: string,
) {
  const scraperResponse = await c.env.Scraper.fetch(
    `https://Scraper/?url=${url}`,
  );
  const scraperResponseBody = await scraperResponse.json();
  const { textContent } = scraperResponseBody as { textContent: string };

  const extractionResponse = await c.env.RecipeExtraction.fetch(
    "https://RecipeExtraction/",
    {
      method: "POST",
      body: JSON.stringify({ textContent }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const extractionResponseBody = (await extractionResponse.json()) as {};
  return extractionResponseBody;
}
