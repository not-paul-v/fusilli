import {
	WorkflowEntrypoint,
	type WorkflowEvent,
	type WorkflowStep,
} from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";
import puppeteer, { type Page } from "@cloudflare/puppeteer";
import {
	autochunk,
	db,
	ingredient as ingredientTable,
	recipe as recipeTable,
	step as stepTable,
} from "@fusilli/db";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import invariant from "tiny-invariant";
import { match } from "ts-pattern";
import { extractRecipeSystemPrompt } from "@/prompts/recipe";
import { recipeSchema } from "@/schemas/recipe";
import type { server } from "../../../../alchemy.run";

export type Params = {
	url: string;
	userId: string;
};

export class ExtractRecipeWorkflow extends WorkflowEntrypoint<
	typeof server.Env,
	Params
> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
		const { url, userId } = event.payload;

		await step.do("check if recipe exists", async () => {
			const existingRecipe = await db.query.recipe.findFirst({
				where: (recipe, { and, eq }) =>
					and(eq(recipe.userId, userId), eq(recipe.originUrl, url)),
			});
			if (existingRecipe != null) {
				throw new NonRetryableError("Recipe already exists");
			}
		});

		const textContent = await step.do(
			"extract text content from page",
			{
				retries: {
					limit: 2,
					delay: "10 seconds",
				},
			},
			async () => {
				const browser = await puppeteer.launch(this.env.BROWSER);
				const page = await browser.newPage();
				await page.goto(url);
				const textContent = await extractPrimaryText(page);
				await browser.close();
				return textContent;
			},
		);

		const llmRecipe = await step.do(
			"extract recipe from text",
			{
				retries: {
					limit: 2,
					delay: "10 seconds",
				},
			},
			async () => {
				const openrouter = createOpenRouter({
					apiKey: this.env.OPENROUTER_API_KEY,
				});

				const { object: recipe } = await generateObject({
					model: openrouter.chat("google/gemini-2.5-flash"),
					prompt: textContent,
					schema: recipeSchema,
					system: extractRecipeSystemPrompt,
				});
				return recipe;
			},
		);

		await step.do(
			"save in db",
			{ retries: { limit: 0, delay: 0 } },
			async () => {
				const inserted = await db
					.insert(recipeTable)
					.values({
						userId,
						name: llmRecipe.name,
						description: llmRecipe.description,
						slug: slugify(llmRecipe.name), // TODO: handle duplicate slugs
						originUrl: url,
					})
					.returning({ id: recipeTable.id });

				const recipeId = inserted[0]?.id;
				invariant(recipeId, "Failed to insert recipe");

				const steps: (typeof stepTable.$inferInsert)[] = llmRecipe.steps.map(
					(stepText, i) => ({
						recipeId: recipeId,
						order: i,
						content: stepText,
					}),
				);
				const ingredients: (typeof ingredientTable.$inferInsert)[] =
					llmRecipe.ingredients.map((ingredient) => {
						return match(ingredient)
							.with({ type: "exact" }, (exactIngredient) => ({
								recipeId: recipeId,
								name: exactIngredient.name,
								amount: exactIngredient.amount,
								unit: exactIngredient.unit,
								type: "exact" as const,
							}))
							.with({ type: "range" }, (rangeIngredient) => ({
								recipeId: recipeId,
								name: rangeIngredient.name,
								minAmount: rangeIngredient.minAmount,
								maxAmount: rangeIngredient.maxAmount,
								unit: rangeIngredient.unit,
								type: "range" as const,
							}))
							.with({ type: "other" }, (otherIngredient) => ({
								recipeId: recipeId,
								name: otherIngredient.name,
								descriptiveAmount: otherIngredient.amount,
								type: "other" as const,
							}))
							.exhaustive();
					});

				await autochunk({ items: steps }, (chunk) =>
					db.insert(stepTable).values(chunk),
				);
				await autochunk({ items: ingredients }, (chunk) =>
					db.insert(ingredientTable).values(chunk),
				);
			},
		);
	}
}

async function extractPrimaryText(page: Page): Promise<string> {
	// Try <article>
	const article = await page.$("article");
	if (article) {
		return article.evaluate((a) => a.innerText.trim());
	}

	// Then <main>
	const main = await page.$("main");
	if (main) {
		return main.evaluate((m) => m.innerText.trim());
	}

	const body = await page.$("body");
	if (body) {
		return body.evaluate((b) => b.innerText.trim());
	}
	throw new Error("No primary text found");
}

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
