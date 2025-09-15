import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import invariant from "tiny-invariant";

export module Scraper {
  export async function scrape(url: string) {
    const html = await getHtml(url);
    const article = extractText(html);

    invariant(article, "Could not extract article from HTML");
    invariant(article?.content != null, "No content in article");
    invariant(article?.textContent != null, "No text content in article");

    const content = cleanText(article.content);
    const textContent = cleanText(article.textContent);

    return {
      title: article?.title ?? null,
      content,
      textContent,
      length: article?.length ?? null,
      publishedTime: article?.publishedTime ?? null,
    };
  }

  async function getHtml(url: string) {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  }

  function extractText(html: string) {
    var doc = parseHTML(html);
    let reader = new Readability(doc.window.document);
    return reader.parse();
  }

  function cleanText(text: string) {
    return (
      text
        // Replace various whitespace and zero-width characters with a single space
        .replace(/[\s\t\u200B-\u200D\uFEFF]+/g, " ")
        // Remove leading whitespace from each line in the string
        .replace(/^\s+/gm, "")
        // Collapse multiple newline characters into a single newline
        .replace(/\n+/g, "\n")
    );
  }
}
