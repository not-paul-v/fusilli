import { z } from "zod";

const quantitySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("exact"),
    value: z.number(),
  }),
  z.object({
    type: z.literal("range"),
    minValue: z.number(),
    maxValue: z.number(),
  }),
]);

export const recipeSchema = z.object({
  dishName: z.string(),
  description: z.string().nullable(),
  rating: z.number().min(0).max(5).nullable(),
  numberOfServings: z.number().int().default(1),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: quantitySchema,
      unit: z.string().nullable(),
      isOptional: z.boolean(),
    }),
  ),
  otherIngredients: z.array(
    z.object({
      name: z.string(),
      quantityDescription: z.string(),
      isOptional: z.boolean(),
    }),
  ),
  nutritionalValues: z
    .object({
      calories: z.number().int().nullable(),
      macronutrients: z.array(
        z.object({
          name: z.enum(["Eiweiß", "Fett", "Kohlenhydrate"]),
          amountInGrams: z.number().nullable(),
        }),
      ),
    })
    .optional(),
  preparation: z.object({
    totalTimeInMinutes: z.number().int().nullable(),
    activeTimeInMinutes: z.number().int().nullable(),
    cookingTimeInMinutes: z.number().int().nullable(),
    steps: z.array(
      z.object({
        usedIngredientNames: z.array(z.string()),
        instructions: z.string(),
      }),
    ),
  }),
});
