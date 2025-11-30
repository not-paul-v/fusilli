import { env } from "cloudflare:workers";
import invariant from "tiny-invariant";

export async function extractTextFromPdf(key: string): Promise<string> {
	const pdf = await env.BUCKET.get(key);
	invariant(pdf != null, `PDF ${key} wasn't found`);

	const [response] = await env.AI.toMarkdown([
		{
			name: pdf.key,
			blob: new Blob([await pdf.arrayBuffer()], {
				type: "application/octet-stream",
			}),
		},
	]);
	invariant(response != null, "File could not be converted to markdown");

	return response.data;
}
