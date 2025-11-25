import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ingredientCollection } from "@/collections/ingredient";
import { recipeCollection } from "@/collections/recipe";
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
		<div>
			<code>{JSON.stringify(recipe, null, 2)}</code>
			<br />
			{recipe && <Ingredients recipeId={recipe.id} />}
		</div>
	);
}

function Ingredients({ recipeId }: { recipeId: string }) {
	const { data: ingredientsData } = useLiveQuery((q) =>
		q
			.from({ ingredient: ingredientCollection })
			.where(({ ingredient }) => eq(ingredient.recipeId, recipeId)),
	);
	return (
		<div>
			<code>{JSON.stringify(ingredientsData, null, 2)}</code>
		</div>
	);
}
