import {
	autochunk,
	db,
	ingredient as ingredientTable,
	recipe as recipeTable,
	step as stepTable,
} from "@fusilli/db";
import invariant from "tiny-invariant";
import { flattenIngredient } from "@/utils/ingredient-conversion";
import type { LLMRecipeResponse } from "@/schemas/recipe";

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

export async function saveRecipeToDb(
	llmRecipe: LLMRecipeResponse,
	userId: string,
	originUrl: string,
) {
	const [recipe] = await db
		.insert(recipeTable)
		.values({
			userId,
			name: llmRecipe.name,
			description: llmRecipe.description,
			slug: slugify(llmRecipe.name), // TODO: handle duplicate slugs
			originUrl,
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
