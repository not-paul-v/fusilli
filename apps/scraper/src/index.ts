import { WorkerEntrypoint } from "cloudflare:workers";
import puppeteer from "@cloudflare/puppeteer";
import type { Page } from "@cloudflare/puppeteer";

export default class Scraper extends WorkerEntrypoint {
  async fetch() {
    return new Response("Not found", { status: 404 });
  }

  async getTextContentOfPage(url: string): Promise<{ textContent: string }> {
    const browser = await puppeteer.launch(this.env.BROWSER);
    const page = await browser.newPage();
    await page.goto(url);
    const textContent = await extractPrimaryText(page);
    await browser.close();
    return { textContent };
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
