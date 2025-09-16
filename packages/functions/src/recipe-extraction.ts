import type { Ai } from "@cloudflare/workers-types";
import { RecipeExtraction } from "@kochbuch/core/recipe-extraction";
import OpenAI from "openai";
import z from "zod";

export interface Env {
  AI: Ai;
  OPENROUTER_TOKEN: string;
}

export default {
  async fetch(req: Request, env: Env) {
    if (req.method == "POST") {
      const body = await req.json();
      if (!body) {
        return new Response("Missing text parameter", { status: 400 });
      }

      const result = inputSchema.safeParse(body);
      if (!result.success) {
        console.error("Invalid input:", result.error);
        return new Response("Invalid input", { status: 400 });
      }

      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: env.OPENROUTER_TOKEN,
      });

      try {
        const extractedRecipe = await RecipeExtraction.extractWithOpenRouter(
          openai,
          result.data.textContent,
        );
        return Response.json(extractedRecipe);
      } catch (error) {
        console.error("Error calling AI model:", error);
        return new Response("Error processing request", { status: 500 });
      }
    }

    return new Response("Method not allowed", { status: 405 });
  },
};

const inputSchema = z.object({
  textContent: z.string().min(100).max(8000),
});
