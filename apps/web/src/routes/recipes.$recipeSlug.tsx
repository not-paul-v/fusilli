import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, redirect } from "@tanstack/react-router";
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
			Hello "/recipes/$recipeSlug"!{" "}
			<code>{JSON.stringify(recipe, null, 2)}</code>
		</div>
	);
}
