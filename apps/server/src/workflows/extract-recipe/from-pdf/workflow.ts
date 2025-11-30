import type { WorkflowStep } from "cloudflare:workers";
import type { Recipe } from "@fusilli/db";
import type { Origin } from "@/workflows/types";
import { BaseExtractRecipeWorkflow } from "../base-workflow";
import { extractTextFromPdf } from "./extract-text-from-pdf";

export type ExtractRecipeFromPDFParams = {
	userId: string;
	fileName: string;
	r2Key: string;
};

export class ExtractRecipeFromPDFWorkflow extends BaseExtractRecipeWorkflow<ExtractRecipeFromPDFParams> {
	protected getWorkflowName(): string {
		return "Extract Recipe From File Workflow";
	}

	protected getOrigin(payload: ExtractRecipeFromPDFParams): Origin {
		return {
			type: "pdf",
			r2Key: payload.r2Key,
		};
	}

	protected async getExistingRecipe(): Promise<Recipe | null> {
		// alwys extract the recipe from a pdf file
		return null;
	}

	protected async extractTextContent(
		step: WorkflowStep,
		payload: ExtractRecipeFromPDFParams,
	): Promise<string> {
		return step.do(
			"extract text content from file",
			{
				retries: {
					limit: 2,
					delay: "10 seconds",
				},
			},
			async () => {
				return extractTextFromPdf(payload.r2Key);
			},
		);
	}
}
