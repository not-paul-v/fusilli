import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { extractRecipeSystemPrompt } from "@/prompts/recipe";
import {
	type LLMRecipeResponse,
	llmRecipeResponseSchema,
} from "@/schemas/recipe";

export async function extractRecipeWithLLM(
	textContent: string,
	openRouterApiKey: string,
): Promise<LLMRecipeResponse> {
	const openrouter = createOpenRouter({
		apiKey: openRouterApiKey,
	});

	const { object: recipe } = await generateObject({
		model: openrouter.chat("openai/gpt-oss-120b", {
			provider: { order: ["cerebras"] },
		}),
		prompt: textContent,
		schema: llmRecipeResponseSchema,
		system: extractRecipeSystemPrompt,
	});

	return recipe;
}
