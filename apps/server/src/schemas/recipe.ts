import { z } from "zod";

const exactIngredientSchema = z.object({
  type: z.literal("exact"),
  name: z.string().describe("Name of the ingredient."),
  unit: z.string().describe("Unit of measurement (e.g., g, ml, tbsp, pcs)."),
  amount: z.number().describe("The exact numerical amount of the ingredient."),
});

const rangeIngredientSchema = z.object({
  type: z.literal("range"),
  name: z.string().describe("Name of the ingredient."),
  unit: z.string().describe("Unit of measurement (e.g., g, ml, pcs)."),
  minAmount: z.number().describe("The lower end of the amount range."),
  maxAmount: z.number().describe("The upper end of the amount range."),
});

const otherIngredientSchema = z.object({
  type: z.literal("other"),
  name: z.string().describe("Name of the ingredient."),
  amount: z
    .string()
    .describe("Descriptive amount (e.g., 'a pinch', 'to taste')."),
});

const ingredientSchema = z.discriminatedUnion("type", [
  exactIngredientSchema,
  rangeIngredientSchema,
  otherIngredientSchema,
]);

export const recipeSchema = z.object({
  name: z.string().describe("The name or title of the recipe."),
  description: z
    .string()
    .describe("A short, engaging description of the recipe."),
  ingredients: z
    .array(ingredientSchema)
    .describe("A list of all ingredients required for the recipe."),
  steps: z
    .array(z.string())
    .describe("An ordered list of the cooking instructions."),
});

export type Recipe = z.infer<typeof recipeSchema>;
