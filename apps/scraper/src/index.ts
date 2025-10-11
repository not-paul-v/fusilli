import { WorkerEntrypoint } from "cloudflare:workers";
import puppeteer from "@cloudflare/puppeteer";

export default class Scraper extends WorkerEntrypoint {
  async fetch() {
    return new Response("Not found", { status: 404 });
  }

  async getTextContentOfPage(url: string): Promise<{ textContent: string }> {
    console.log("trying to get contents of page", url);
    const browser = await puppeteer.launch(this.env.BROWSER);
    console.log("browser launched");
    const page = await browser.newPage();
    console.log("goto page");
    await page.goto(url);

    // console.log("trying to extract");
    // const extractedText = await page.$eval("*", (el) => el.innerText);
    // console.log("extracted", extractedText);

    await browser.close();

    return { textContent: "test" };
  }
}
