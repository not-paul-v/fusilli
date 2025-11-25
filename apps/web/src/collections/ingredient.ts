import { createCollection, parseLoadSubsetOptions } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import invariant from "tiny-invariant";
import z from "zod";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

// TODO: return union type from backend
const ingredientSchema = z.object({
	id: z.string(),
	name: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	recipeId: z.string(),
	type: z.string(),
	unit: z.string().nullable(),
	amount: z.number().nullable(),
	minAmount: z.number().nullable(),
	maxAmount: z.number().nullable(),
	descriptiveAmount: z.string().nullable(),
});

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
			if ("error" in json) {
				throw new Error(json.error);
			}
			return json;
		},
	}),
);
