import { Hono } from "hono";
import { Bindings, Variables } from "./types";
import { getRecipeFromLink } from "./recipes.service";
import { OpenAI } from "openai";
import { env } from "hono/adapter";
import { dbMiddleware } from "./middleware/db";

export module Recipes {
  export const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

  app.use(dbMiddleware);

  app.get("/from-link", async (c) => {
    const url = c.req.query("url");
    if (url == null) {
      return c.json({ error: "Missing url parameter" }, 400);
    }

    const { OPENROUTER_TOKEN } = env<{ OPENROUTER_TOKEN: string }>(c);
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: OPENROUTER_TOKEN,
    });

    const recipe = await getRecipeFromLink(url, openai);
    return c.json(recipe);
  });
}
