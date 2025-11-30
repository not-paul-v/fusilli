import { env } from "cloudflare:workers";
import invariant from "tiny-invariant";
import { extractText } from "unpdf";

export async function extractTextFromPdf(key: string): Promise<string> {
	const pdf = await env.BUCKET.get(key);
	invariant(pdf != null, `PDF ${key} wasn't found`);

	const buffer = await pdf.arrayBuffer();
	const { text } = await extractText(new Uint8Array(buffer));

	return text.join("\n\n");
}
