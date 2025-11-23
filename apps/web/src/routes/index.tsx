import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { recipeCollection } from "@/collections/recipe";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
	component: HomeComponent,
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
});

function HomeComponent() {
	const { data } = useLiveQuery((q) => q.from({ recipe: recipeCollection }));

	return (
		<div className="w-full px-4 py-2">
			<div className="space-y-2">
				{data.map((recipe) => (
					<Link
						key={recipe.id}
						to="/recipes/$recipeSlug"
						params={{ recipeSlug: recipe.slug }}
					>
						<div className="border-b py-2">
							<div className="flex flex-col gap-2">
								<div>
									<strong>{recipe.name}</strong>
								</div>
								<div className="text-sm">{recipe.description}</div>
								<div className="text-muted-foreground text-sm">
									{new Date(recipe.createdAt).toLocaleDateString()}
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
