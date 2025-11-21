import {
  type AuthMiddlewareVariables,
  authMiddleware,
} from "@/middleware/auth";
import { db } from "@fusilli/db";
import { zValidator } from "@hono/zod-validator";
import { env } from "cloudflare:workers";
import { Hono } from "hono";
import z from "zod";

export const recipeRoutes = new Hono<{ Variables: AuthMiddlewareVariables }>()
  .use(authMiddleware)
  .get(
    "/from-link",
    zValidator(
      "query",
      z.object({
        url: z.url(),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const instance = await env.EXTRACT_RECIPE_WORKFLOW.create({
        params: {
          url: c.req.valid("query").url,
          userId: user.id,
        },
      });

      return c.json({
        id: instance.id,
        details: await instance.status(),
      });
    },
  )
  .get("/", async (c) => {
    const user = c.get("user");
    const recipes = await db.query.recipe.findMany({
      where: (recipe, { eq }) => eq(recipe.userId, user.id),
      orderBy: (recipe, { desc }) => desc(recipe.createdAt),
    });
    return c.json(recipes);
  })
  .get("/:slug", async (c) => {
    const recipeSlug = c.req.param("slug");
    const recipe = await db.query.recipe.findFirst({
      where: (recipe, { eq }) => eq(recipe.slug, recipeSlug),
    });
    if (!recipe) {
      return c.json({ error: "Recipe not found" }, 404);
    }
    return c.json(recipe);
  })
  .get("/:id/ingredients", async (c) => {
    const recipeId = c.req.param("id");
    const ingredients = await db.query.ingredient.findMany({
      where: (ingredient, { eq }) => eq(ingredient.recipeId, recipeId),
      orderBy: (ingredient, { asc }) => asc(ingredient.createdAt),
    });
    return c.json(ingredients);
  })
  .get("/:id/steps", async (c) => {
    const recipeId = c.req.param("id");
    const steps = await db.query.step.findMany({
      where: (step, { eq }) => eq(step.recipeId, recipeId),
      orderBy: (step, { asc }) => asc(step.createdAt),
    });
    return c.json(steps);
  });
