import {
	autochunk,
	db,
	ingredient as ingredientTable,
	type Recipe,
	recipe as recipeTable,
	step as stepTable,
} from "@fusilli/db";
import invariant from "tiny-invariant";
import { match } from "ts-pattern";
import type { LLMRecipeResponse } from "@/schemas/recipe";
import { flattenIngredient } from "@/utils/ingredient-conversion";
import type { Origin } from "@/workflows/types";

function slugify(text: string): string {
	return text
		.normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
		.toLowerCase() // Convert the string to lowercase letters
		.trim() // Remove whitespace from both sides of a string (optional)
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/[^\w-]+/g, "") // Remove all non-word chars
		.replace(/_/g, "-") // Replace _ with -
		.replace(/--+/g, "-") // Replace multiple - with single -
		.replace(/-$/g, ""); // Remove trailing -
}

type DBOrigin = Pick<Recipe, "origin" | "originUrl" | "r2Key">;

export async function saveRecipeToDb(
	llmRecipe: LLMRecipeResponse,
	userId: string,
	origin: Origin,
) {
	const originValues = match<Origin, DBOrigin>(origin)
		.with({ type: "url" }, ({ url }) => ({
			origin: "url",
			originUrl: url,
			r2Key: null,
		}))
		.with({ type: "pdf" }, ({ r2Key }) => ({
			origin: "pdf",
			r2Key,
			originUrl: null,
		}))
		.exhaustive();

	const [recipe] = await db
		.insert(recipeTable)
		.values({
			userId,
			name: llmRecipe.name,
			description: llmRecipe.description,
			slug: slugify(llmRecipe.name), // TODO: handle duplicate slugs
			...originValues,
		})
		.returning();

	invariant(recipe != null, "Failed to insert recipe");

	const steps: (typeof stepTable.$inferInsert)[] = llmRecipe.steps.map(
		(stepText, i) => ({
			recipeId: recipe.id,
			order: i,
			content: stepText,
		}),
	);
	const ingredients: (typeof ingredientTable.$inferInsert)[] =
		llmRecipe.ingredients.map((ingredient) =>
			flattenIngredient(ingredient, recipe.id),
		);

	await autochunk({ items: steps }, (chunk) =>
		db.insert(stepTable).values(chunk),
	);
	await autochunk({ items: ingredients }, (chunk) =>
		db.insert(ingredientTable).values(chunk),
	);

	return recipe;
}
