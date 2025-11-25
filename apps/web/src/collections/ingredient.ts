import { createCollection, parseLoadSubsetOptions } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import invariant from "tiny-invariant";
import z from "zod";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

const baseIngredientSchema = z.object({
	id: z.string(),
	recipeId: z.string(),
});

const exactIngredientSchema = baseIngredientSchema.extend({
	type: z.literal("exact"),
	name: z.string(),
	unit: z.string(),
	amount: z.number(),
});

const rangeIngredientSchema = baseIngredientSchema.extend({
	type: z.literal("range"),
	name: z.string(),
	unit: z.string(),
	minAmount: z.number(),
	maxAmount: z.number(),
});

const otherIngredientSchema = baseIngredientSchema.extend({
	type: z.literal("other"),
	name: z.string(),
	amount: z.string(),
});

const ingredientSchema = z.discriminatedUnion("type", [
	exactIngredientSchema,
	rangeIngredientSchema,
	otherIngredientSchema,
]);

type Query = {
	recipeId?: string;
};

export const ingredientCollection = createCollection(
	queryCollectionOptions({
		id: "ingredients",
		queryKey: ["ingredients"],
		queryClient,
		schema: ingredientSchema,
		getKey: (item) => item.id,
		syncMode: "on-demand",

		queryFn: async (ctx) => {
			// @ts-expect-error https://github.com/TanStack/db/pull/869
			const { limit, where, orderBy } = ctx.meta.loadSubsetOptions;
			const parsed = parseLoadSubsetOptions({ where, orderBy, limit });

			const query: Query = {};
			for (const filter of parsed.filters) {
				invariant(filter.operator === "eq", "Only eq is supported");

				const fieldName = filter.field.join(".");
				if (fieldName === "recipeId") {
					query.recipeId = filter.value as string;
				}
			}

			invariant(query.recipeId != null, "Must supply recipe id to query");
			const response = await apiClient.api.ingredients.$get({
				query: { recipe_id: query.recipeId },
			});
			const json = await response.json();
			// Workaround since type inference doesn't seem to work here
			return ingredientSchema.array().parse(json.ingredients);
		},
	}),
);
