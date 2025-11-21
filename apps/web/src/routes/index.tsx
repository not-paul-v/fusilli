import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "@tanstack/react-db";
import { recipeCollection } from "@/collections/recipe";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: async () => {
    recipeCollection.preload();
    return null;
  },
});

function HomeComponent() {
  const { data } = useLiveQuery((q) => q.from({ recipe: recipeCollection }));

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <code>{JSON.stringify(data, null, 2)}</code>
    </div>
  );
}
