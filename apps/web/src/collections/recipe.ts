import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryClient } from "../lib/query-client";
import { apiClient } from "@/lib/api-client";
import z from "zod";

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
    queryKey: ["recipes"],
    queryFn: async ({ meta }) => {
      const response = await apiClient.api.recipes.$get();
      return response.json();
    },
    schema: recipeSchema,
    queryClient,
    getKey: (item) => item.id,
  }),
);
