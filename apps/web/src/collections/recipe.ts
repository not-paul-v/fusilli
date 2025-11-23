import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import z from "zod";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "../lib/query-client";

const recipeSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	originUrl: z.string(),
	slug: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const recipeCollection = createCollection(
	queryCollectionOptions({
		id: "recipes",
		queryKey: ["recipes"],
		queryClient,
		getKey: (item) => item.id,
		schema: recipeSchema,
		// TODO: switch to on-demand and load recipe by slug
		// https://github.com/TanStack/db/pull/869
		syncMode: "eager",

		queryFn: async () => {
			const response = await apiClient.api.recipes.$get();
			return response.json();
		},
	}),
);
