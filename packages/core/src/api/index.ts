import { Hono } from "hono";
import { Bindings } from "./types";
import { getRecipeFromLink } from "./recipes.service";

export module Recipes {
  export const app = new Hono<{ Bindings: Bindings }>();

  app.get("/from-link", async (c) => {
    const url = c.req.query("url");
    if (url == null) {
      return c.json({ error: "Missing url parameter" }, 400);
    }

    const recipe = getRecipeFromLink(c, url);
    return c.json(recipe);
  });
}
