import { env } from "cloudflare:workers";
import { auth } from "@fusilli/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { db } from "@fusilli/db";

export * from "./workflows";

const api = new Hono()
  .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))
  .get("/workflows/:workflowId", async (c) => {
    const workflow = await env.EXTRACT_RECIPE_WORKFLOW.get(
      c.req.param("workflowId"),
    );
    const status = await workflow.status();
    return c.json({
      id: workflow.id,
      status,
    });
  })
  .get(
    "/recipes/from-link",
    zValidator(
      "query",
      z.object({
        url: z.url(),
      }),
    ),
    async (c) => {
      const instance = await env.EXTRACT_RECIPE_WORKFLOW.create({
        params: {
          url: c.req.valid("query").url,
        },
      });

      return c.json({
        id: instance.id,
        details: await instance.status(),
      });
    },
  )
  .get("/recipes", async (c) => {
    const recipes = await db.query.recipe.findMany({
      orderBy: (recipe, { desc }) => desc(recipe.createdAt),
    });
    return c.json(recipes);
  })
  .get("/recipes/:slug", async (c) => {
    const recipeSlug = c.req.param("slug");
    const recipe = await db.query.recipe.findFirst({
      where: (recipe, { eq }) => eq(recipe.slug, recipeSlug),
    });
    if (!recipe) {
      return c.json({ error: "Recipe not found" }, 404);
    }
    return c.json(recipe);
  })
  .get("/recipes/:id/ingredients", async (c) => {
    const recipeId = c.req.param("id");
    const ingredients = await db.query.ingredient.findMany({
      where: (ingredient, { eq }) => eq(ingredient.recipeId, recipeId),
      orderBy: (ingredient, { asc }) => asc(ingredient.createdAt),
    });
    return c.json(ingredients);
  })
  .get("/recipes/:id/steps", async (c) => {
    const recipeId = c.req.param("id");
    const steps = await db.query.step.findMany({
      where: (step, { eq }) => eq(step.recipeId, recipeId),
      orderBy: (step, { asc }) => asc(step.createdAt),
    });
    return c.json(steps);
  });

const app = new Hono()
  .use(logger())
  .use(
    "/*",
    cors({
      origin: env.CORS_ORIGIN || "",
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .route("/api", api);

export default api;
export type AppType = typeof app;
