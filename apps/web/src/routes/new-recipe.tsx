import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileUpIcon, LinkIcon, LoaderIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { match } from "ts-pattern";
import { recipeCollection } from "@/collections/recipe";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/new-recipe")({
	component: NewRecipeRoute,
});

function NewRecipeRoute() {
	const [isLoading, setIsLoading] = useState(false);

	const { data: urlData, mutate: mutateFromLink } = useMutation({
		mutationFn: async (url: string) => {
			const response = await apiClient.api.recipes["from-link"].$post({
				query: { url },
			});
			return response.json();
		},
	});

	const { data: pdfData, mutate: mutateFromPdf } = useMutation({
		mutationFn: async (file: File) => {
			const response = await apiClient.api.recipes["from-pdf"].$post({
				form: { file },
			});
			return response.json();
		},
	});

	const data = urlData || pdfData;

	const handleAddRecipe = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		const file = formData.get("pdf") as File | null;
		const link = formData.get("link") as string;

		if (file && file.size > 0) {
			mutateFromPdf(file);
		} else {
			mutateFromLink(link);
		}
	};

	return (
		<div className="container mx-auto max-w-2xl py-8">
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="flex items-center justify-center gap-2 text-2xl">
						Add New Recipe
					</CardTitle>
					<CardDescription>
						Enter a URL or upload a PDF to extract and add a recipe to your
						collection
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleAddRecipe} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="link" className="font-medium text-sm">
								Recipe URL
							</Label>
							<div className="relative">
								<LinkIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-muted-foreground" />
								<Input
									disabled={isLoading}
									id="link"
									name="link"
									placeholder="https://example.com/recipe"
									className="pl-10"
									autoFocus
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="pdf" className="font-medium text-sm">
								Or upload a PDF
							</Label>
							<div className="relative">
								<FileUpIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 transform text-muted-foreground" />
								<Input
									disabled={isLoading}
									id="pdf"
									name="pdf"
									type="file"
									accept=".pdf"
									className="pl-10"
								/>
							</div>
						</div>

						{data?.id != null ? (
							<RecipeExtractionStatus workflowId={data.id} />
						) : null}

						<Button
							disabled={isLoading}
							type="submit"
							className="w-full"
							size="lg"
						>
							{isLoading ? (
								<>
									<LoaderIcon className="mr-2 size-4 animate-spin" />
									Extracting Recipe...
								</>
							) : (
								<>
									<PlusIcon className="mr-2 size-4" />
									Add Recipe
								</>
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

function RecipeExtractionStatus({ workflowId }: { workflowId: string }) {
	const navigate = useNavigate();

	const { data, isLoading } = useQuery({
		queryKey: ["recipe-extraction-status", workflowId],
		queryFn: async () => {
			const response = await apiClient.api.workflows[":workflowId"].$get({
				param: { workflowId },
			});
			return response.json();
		},
		refetchInterval: 2000,
	});

	useEffect(() => {
		if (data?.status === "success") {
			recipeCollection.utils.refetch();
			setTimeout(() => {
				navigate({
					to: "/recipes/$recipeSlug",
					params: { recipeSlug: data.recipe.slug },
				});
			}, 2000);
		}
	}, [data, navigate]);

	if (data == null) {
		return null;
	}

	return (
		<div className="flex items-center gap-3">
			<div className="flex-1">
				<p className="font-medium">
					{isLoading
						? "Extracting recipe..."
						: match(data.status)
								.with("success", () => "Recipe extracted successfully!")
								.with("error", () => "Failed to extract recipe")
								.otherwise(() => `Status: ${data.status || "Processing..."}`)}
				</p>
				{data?.status === "success" && (
					<p className="mt-1 text-muted-foreground text-sm">
						Redirecting to your recipes...
					</p>
				)}
			</div>
			<code>{JSON.stringify(data, null, 2)}</code>
		</div>
	);
}
