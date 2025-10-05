import { Hono } from "hono";
import { Bindings, Env, Variables } from "./types";
import { getRecipeFromLink } from "./recipes.service";
import { OpenAI } from "openai";
import { env } from "hono/adapter";
import { drizzleMiddleware } from "./middleware/drizzle";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { auth, createAuth } from "./auth";
import { corsMiddleware } from "./middleware/cors";
import { authMiddleware } from "./middleware/auth";

export module API {
  export const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

  app.use(drizzleMiddleware);
  app.use(corsMiddleware);
  app.use(authMiddleware);

  app.on(["GET", "POST"], "/auth/*", (c) => {
    const db = c.get("db");
    const auth = createAuth(db);
    return auth.handler(c.req.raw);
  });

  const routes = app.get(
    "/from-link",
    zValidator("query", z.object({ url: z.string() })),
    async (c) => {
      const { url } = c.req.valid("query");
      const { OPENROUTER_TOKEN } = env<Env>(c);
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
