import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { match } from "ts-pattern";
import {
	type Ingredient,
	ingredientCollection,
} from "@/collections/ingredient";
import { type Recipe, recipeCollection } from "@/collections/recipe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/recipes/$recipeSlug")({
	loader: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		recipeCollection.preload();
		return { session };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { recipeSlug } = Route.useParams();
	const { data: recipesData } = useLiveQuery((q) =>
		q
			.from({ recipe: recipeCollection })
			.where(({ recipe }) => eq(recipe.slug, recipeSlug)),
	);
	const [recipe] = recipesData;

	return (
		<div className="container mx-auto space-y-6 py-8">
			{recipe && <RecipeDisplay recipe={recipe} />}
			{recipe && <IngredientsDisplay recipeId={recipe.id} />}
		</div>
	);
}

function RecipeDisplay({ recipe }: { recipe: Recipe }) {
	return (
		<div>
			<h2 className="font-bold text-3xl tracking-tight">{recipe.name}</h2>
			<p className="mt-2 text-gray-600">{recipe.description}</p>
		</div>
	);
}

function IngredientsDisplay({ recipeId }: { recipeId: string }) {
	const { data: ingredientsData } = useLiveQuery((q) =>
		q
			.from({ ingredient: ingredientCollection })
			.where(({ ingredient }) => eq(ingredient.recipeId, recipeId)),
	);

	if (!ingredientsData || ingredientsData.length === 0) {
		return (
			<Card>
				<CardContent className="py-8 text-center">
					<p className="text-gray-500">No ingredients found for this recipe</p>
				</CardContent>
			</Card>
		);
	}

	const groupedIngredients = groupIngredientsByType(ingredientsData);
	const sectionTypes = ["exact", "range", "other"] as const;

	return (
		<div className="space-y-6">
			{sectionTypes.map((type) => {
				const ingredients = groupedIngredients[type];
				if (!ingredients || ingredients.length === 0) return null;

				const { title, description } = getSectionInfo(type);

				return (
					<Card key={type}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								{match(type)
									.with("exact", () => "📏")
									.with("range", () => "📊")
									.with("other", () => "📝")
									.exhaustive()}{" "}
								{title}
							</CardTitle>
							<p className="text-gray-600 text-sm">{description}</p>
						</CardHeader>
						<CardContent>
							<ul className="space-y-0">
								{ingredients.map((ingredient) => (
									<IngredientItem key={ingredient.id} ingredient={ingredient} />
								))}
							</ul>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

function IngredientItem({ ingredient }: { ingredient: Ingredient }) {
	const displayValue = match(ingredient)
		.with({ type: "exact" }, (ing) => `${ing.amount} ${ing.unit}`)
		.with(
			{ type: "range" },
			(ing) => `${ing.minAmount}-${ing.maxAmount} ${ing.unit}`,
		)
		.with({ type: "other" }, (ing) => ing.amount)
		.exhaustive();

	return (
		<li className="flex items-center justify-between border-gray-100 border-b py-2 last:border-b-0">
			<span className="font-medium">{ingredient.name}</span>
			<span className="font-mono text-gray-600 text-sm">{displayValue}</span>
		</li>
	);
}

function groupIngredientsByType(ingredients: Ingredient[]) {
	return ingredients.reduce(
		(groups, ingredient) => {
			const groupKey = ingredient.type;
			if (!groups[groupKey]) {
				groups[groupKey] = [];
			}
			groups[groupKey].push(ingredient);
			return groups;
		},
		{} as Record<"exact" | "range" | "other", Ingredient[]>,
	);
}

function getSectionInfo(type: "exact" | "range" | "other") {
	return match(type)
		.with("exact", () => ({
			title: "Measured Ingredients",
			description: "Ingredients with precise measurements",
		}))
		.with("range", () => ({
			title: "Variable Amount Ingredients",
			description: "Ingredients with flexible quantities",
		}))
		.with("other", () => ({
			title: "Other Ingredients",
			description: "Ingredients with non-standard measurements",
		}))
		.exhaustive();
}
