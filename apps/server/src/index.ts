import { env } from "cloudflare:workers";
import { auth } from "@kochbuch/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { RecipeSchema as recipeSchema } from "./schemas/recipe";
import { extractRecipeSystemPrompt } from "./prompts/recipe";

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
  return c.json({ mesasge: "hello" });
});

app.get(
  "/text-contents",
  zValidator(
    "query",
    z.object({
      url: z.url(),
    }),
  ),
  async (c) => {
    const url = c.req.valid("query").url;
    const { textContent } = await env.SCRAPER.getTextContentOfPage(url);
    return new Response(textContent);
  },
);

app.get(
  "/recipes/from-link",
  zValidator(
    "query",
    z.object({
      url: z.url(),
    }),
  ),
  async (c) => {
    const url = c.req.valid("query").url;
    const { textContent } = await env.SCRAPER.getTextContentOfPage(url);

    const { object: recipe } = await generateObject({
      model: openrouter.chat("google/gemini-2.5-flash"),
      prompt: textContent,
      schema: recipeSchema,
      system: extractRecipeSystemPrompt,
    });

    return c.json(recipe);
  },
);

const api = new Hono();
api.route("/api", app);

export default api;
