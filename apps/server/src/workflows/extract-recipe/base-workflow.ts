import {
	WorkflowEntrypoint,
	type WorkflowEvent,
	type WorkflowStep,
} from "cloudflare:workers";
import type { Recipe } from "@fusilli/db";
import type { server } from "../../../../../alchemy.run";
import { Logger } from "../../utils/logger";
import { extractRecipeWithLLM } from "./utils/extract-recipe-with-llm";
import { saveRecipeToDb } from "./utils/save-recipe-to-db";

export abstract class BaseExtractRecipeWorkflow<
	TParams extends { userId: string },
> extends WorkflowEntrypoint<typeof server.Env, TParams> {
	protected abstract extractTextContent(
		step: WorkflowStep,
		payload: TParams,
	): Promise<string>;

	protected abstract getExistingRecipe(
		userId: string,
		payload: TParams,
	): Promise<Recipe | null>;

	protected abstract getOriginUrl(payload: TParams): string;

	protected abstract getWorkflowName(): string;

	async run(event: WorkflowEvent<TParams>, step: WorkflowStep) {
		const payload = event.payload;
		const { userId } = payload;
		const workflowName = this.getWorkflowName();
		const originUrl = this.getOriginUrl(payload);
		const logger = new Logger(workflowName);

		const workflowStartTime = Date.now();

		logger.info(`Starting workflow for User: ${userId}`);

		const recipe = await timer(logger, "check if recipe exists", async () => {
			return step.do("check if recipe exists", async () => {
				return this.getExistingRecipe(userId, payload);
			});
		});

		if (recipe != null) {
			logger.info("Recipe has already been parsed.");
			return recipe;
		}

		const textContent = await timer(
			logger,
			"extract text content",
			async () => {
				return this.extractTextContent(step, payload);
			},
		);

		const llmRecipe = await timer(
			logger,
			"extract recipe from text",
			async () => {
				return step.do(
					"extract recipe from text",
					{
						retries: {
							limit: 2,
							delay: "10 seconds",
						},
					},
					async () => {
						return extractRecipeWithLLM(
							textContent,
							this.env.OPENROUTER_API_KEY,
						);
					},
				);
			},
		);

		const insertedRecipe = await timer(logger, "save in db", async () => {
			return step.do(
				"save in db",
				{ retries: { limit: 0, delay: 0 } },
				async () => {
					return saveRecipeToDb(llmRecipe, userId, originUrl);
				},
			);
		});
		logger.info(
			`Total workflow completed in ${Date.now() - workflowStartTime}ms`,
		);

		return insertedRecipe;
	}
}

async function timer<T>(
	logger: Logger,
	stepName: string,
	fn: () => Promise<T>,
): Promise<T> {
	const startTime = Date.now();
	const result = await fn();
	logger.info(`Step "${stepName}" completed in ${Date.now() - startTime}ms`);
	return result;
}
