import { Context, Hono } from "hono";
import { Bindings } from "./types";
import { OpenAI } from "openai";
import { Scraper } from "../scraper";
import { RecipeExtraction } from "../recipe-extraction";

export async function getRecipeFromLink(url: string, openai: OpenAI) {
  const { textContent } = await Scraper.scrape(url);
  const recipe = await RecipeExtraction.extractWithOpenRouter(
    openai,
    textContent,
  );
  return recipe;
}
