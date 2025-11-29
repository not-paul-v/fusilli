import type { WorkflowStep } from "cloudflare:workers";
import { db, type Recipe } from "@fusilli/db";
import { BaseExtractRecipeWorkflow } from "../base-workflow";
import { extractTextFromUrl } from "./extract-text-from-url";

export type ExtractRecipeFromUrlParams = {
	url: string;
	userId: string;
};

export class ExtractRecipeFromUrlWorkflow extends BaseExtractRecipeWorkflow<ExtractRecipeFromUrlParams> {
	protected getWorkflowName(): string {
		return "Extract Recipe From URL Workflow";
	}

	protected getOriginUrl(payload: ExtractRecipeFromUrlParams): string {
		return payload.url;
	}

	protected async getExistingRecipe(
		userId: string,
		payload: ExtractRecipeFromUrlParams,
	): Promise<Recipe | null> {
		const result = await db.query.recipe.findFirst({
			where: (recipe, { and, eq }) =>
				and(eq(recipe.userId, userId), eq(recipe.originUrl, payload.url)),
		});
		return result ?? null;
	}

	protected async extractTextContent(
		step: WorkflowStep,
		payload: ExtractRecipeFromUrlParams,
	): Promise<string> {
		return step.do(
			"extract text content from page",
			{
				retries: {
					limit: 2,
					delay: "10 seconds",
				},
			},
			async () => {
				return extractTextFromUrl(payload.url, this.env.BROWSER);
			},
		);
	}
}
