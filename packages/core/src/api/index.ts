import { Hono } from "hono";
import { Bindings, Variables } from "./types";
import { getRecipeFromLink } from "./recipes.service";
import { OpenAI } from "openai";
import { env } from "hono/adapter";
import { dbMiddleware } from "./middleware/db";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

export module API {
  export const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

  app.use(dbMiddleware);

  const routes = app.get(
    "/from-link",
    zValidator("query", z.object({ url: z.string() })),
    async (c) => {
      const { url } = c.req.valid("query");
      const { OPENROUTER_TOKEN } = env<{ OPENROUTER_TOKEN: string }>(c);
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: OPENROUTER_TOKEN,
      });

      const recipe = await getRecipeFromLink(url, openai);
      return c.json(recipe);
    },
  );

  export type Api = typeof routes;
}
