import { db, eq, recipe as recipeTable, type SQLWrapper } from "@fusilli/db";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import {
	type AuthMiddlewareVariables,
	authMiddleware,
} from "@/middleware/auth";

export const ingredientRoutes = new Hono<{
	Variables: AuthMiddlewareVariables;
}>()
	.use(authMiddleware)
	.get(
		"/",
		zValidator(
			"query",
			z.object({
				recipe_id: z.string(),
			}),
		),
		async (c) => {
			const user = c.get("user");
			const { recipe_id } = c.req.valid("query");

			const recipe = await db.query.recipe.findFirst({
				where: (recipe, { and, eq }) =>
					and(eq(recipe.id, recipe_id), eq(recipe.userId, user.id)),
			});

			if (!recipe) {
				return c.json({ error: "Recipe not found" }, 404);
			}

			const ingredients = await db.query.ingredient.findMany({
				where: (ingredient, { eq }) => eq(ingredient.recipeId, recipe.id),
				orderBy: (ingredient, { desc }) => desc(ingredient.createdAt),
			});

			return c.json(ingredients);
		},
	);
