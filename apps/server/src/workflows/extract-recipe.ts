import {
  WorkflowEntrypoint,
  WorkflowStep,
  type WorkflowEvent,
} from "cloudflare:workers";
import type { server } from "../../../../alchemy.run";
import puppeteer, { Page } from "@cloudflare/puppeteer";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { recipeSchema } from "@/schemas/recipe";
import { extractRecipeSystemPrompt } from "@/prompts/recipe";

export type Params = {
  url: string;
};

export class ExtractRecipeWorkflow extends WorkflowEntrypoint<
  typeof server.Env,
  Params
> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { url } = event.payload;

    const textContent = await step.do(
      "extract text content from page",
      {
        retries: {
          limit: 1,
          delay: "10 seconds",
        },
      },
      async () => {
        const browser = await puppeteer.launch(this.env.BROWSER);
        const page = await browser.newPage();
        await page.goto(url);
        const textContent = await extractPrimaryText(page);
        await browser.close();
        return textContent;
      },
    );

    const recipe = await step.do(
      "extract recipe from text",
      {
        retries: {
          limit: 3,
          delay: "10 seconds",
        },
      },
      async () => {
        const openrouter = createOpenRouter({
          apiKey: this.env.OPENROUTER_API_KEY,
        });

        const { object: recipe } = await generateObject({
          model: openrouter.chat("google/gemini-2.5-flash"),
          prompt: textContent,
          schema: recipeSchema,
          system: extractRecipeSystemPrompt,
        });
        return recipe;
      },
    );

    await step.do("save in db", async () => {
      console.log("OFAC WORKFLOW STEP 3");
    });
  }
}

async function extractPrimaryText(page: Page): Promise<string> {
  // Try <article>
  const article = await page.$("article");
  if (article) {
    return article.evaluate((a) => a.innerText.trim());
  }

  // Then <main>
  const main = await page.$("main");
  if (main) {
    return main.evaluate((m) => m.innerText.trim());
  }

  const body = await page.$("body");
  if (body) {
    return body.evaluate((b) => b.innerText.trim());
  }
  throw new Error("No primary text found");
}
