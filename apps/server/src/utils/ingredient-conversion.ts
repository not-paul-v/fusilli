import type { ingredient } from "@fusilli/db";
import invariant from "tiny-invariant";
import { match } from "ts-pattern";
import type {
	ExactIngredient,
	Ingredient,
	OtherIngredient,
	RangeIngredient,
} from "@/schemas/recipe";

export type FlatIngredient = typeof ingredient.$inferInsert;
type ExactIngredientWithId = { id: string; recipeId: string } & ExactIngredient;
type RangeIngredientWithId = { id: string; recipeId: string } & RangeIngredient;
type OtherIngredientWithId = { id: string; recipeId: string } & OtherIngredient;

export function flattenIngredient(
	ingredient: Ingredient,
	recipeId: string,
): FlatIngredient {
	return match(ingredient)
		.with({ type: "exact" }, (exactIngredient) => ({
			recipeId,
			name: exactIngredient.name,
			amount: exactIngredient.amount,
			unit: exactIngredient.unit,
			type: "exact" as const,
		}))
		.with({ type: "range" }, (rangeIngredient) => ({
			recipeId,
			name: rangeIngredient.name,
			minAmount: rangeIngredient.minAmount,
			maxAmount: rangeIngredient.maxAmount,
			unit: rangeIngredient.unit,
			type: "range" as const,
		}))
		.with({ type: "other" }, (otherIngredient) => ({
			recipeId,
			name: otherIngredient.name,
			descriptiveAmount: otherIngredient.amount,
			type: "other" as const,
		}))
		.exhaustive();
}

export function unflattenIngredient(
	flatIngredient: FlatIngredient,
): IngredientWithId {
	invariant(flatIngredient.id != null, "Ingredient must have an id");
	const ingredientId = flatIngredient.id;

	return match(flatIngredient)
		.with({ type: "exact" }, (flat) => {
			invariant(flat.amount != null, "Exact ingredient must have amount");
			invariant(flat.unit != null, "Exact ingredient must have unit");
			return {
				id: ingredientId,
				recipeId: flat.recipeId,
				type: "exact" as const,
				name: flat.name,
				amount: flat.amount,
				unit: flat.unit,
			} satisfies ExactIngredientWithId;
		})
		.with({ type: "range" }, (flat) => {
			invariant(flat.minAmount != null, "Range ingredient must have minAmount");
			invariant(flat.maxAmount != null, "Range ingredient must have maxAmount");
			invariant(flat.unit != null, "Range ingredient must have unit");
			return {
				id: ingredientId,
				recipeId: flat.recipeId,
				type: "range" as const,
				name: flat.name,
				minAmount: flat.minAmount,
				maxAmount: flat.maxAmount,
				unit: flat.unit,
			} satisfies RangeIngredientWithId;
		})
		.with({ type: "other" }, (flat) => {
			invariant(
				flat.descriptiveAmount != null,
				"Other ingredient must have descriptiveAmount",
			);
			return {
				id: ingredientId,
				recipeId: flat.recipeId,
				type: "other" as const,
				name: flat.name,
				amount: flat.descriptiveAmount,
			} satisfies OtherIngredientWithId;
		})
		.otherwise(() => {
			throw new Error("Unknown ingredient type");
		});
}
