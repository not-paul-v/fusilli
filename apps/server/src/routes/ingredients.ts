import { db } from "@fusilli/db";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import z from "zod";
import {
	type AuthMiddlewareVariables,
	authMiddleware,
} from "@/middleware/auth";
import { unflattenIngredient } from "@/utils/ingredient-conversion";

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
				throw new HTTPException(404, { message: "Recipe not found" });
			}

			const flatIngredients = await db.query.ingredient.findMany({
				where: (ingredient, { eq }) => eq(ingredient.recipeId, recipe.id),
				orderBy: (ingredient, { desc }) => desc(ingredient.createdAt),
			});

			const ingredients = flatIngredients.map(unflattenIngredient);
			return c.json({ ingredients: ingredients });
		},
	);
