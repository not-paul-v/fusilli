import puppeteer, {
	type ActiveSession,
	type Browser,
	type BrowserWorker,
	type Page,
} from "@cloudflare/puppeteer";
import invariant from "tiny-invariant";

export async function extractTextFromUrl(
	url: string,
	browserBinding: BrowserWorker,
): Promise<string> {
	let sessionId = await getRandomExistingSession(browserBinding);
	let browser: Browser | undefined;

	if (sessionId != null) {
		try {
			browser = await puppeteer.connect(browserBinding, sessionId);
			console.log(`Reused existing session ${sessionId}`);
		} catch (e) {
			// another worker may have connected first
			console.log(`Failed to connect to ${sessionId}. Error ${e}`);
		}
	}

	if (browser == null) {
		browser = await puppeteer.launch(browserBinding);
	}
	sessionId = browser.sessionId();

	const page = await browser.newPage();
	await page.goto(url);
	const textContent = await extractPrimaryText(page);

	browser.disconnect();

	return textContent;
}

async function getRandomExistingSession(endpoint: BrowserWorker) {
	const sessions: ActiveSession[] = await puppeteer.sessions(endpoint);
	console.log(`Sessions: ${JSON.stringify(sessions)}`);
	const sessionsIds = sessions
		.filter((v) => {
			return !v.connectionId; // remove sessions with workers connected to them
		})
		.map((v) => {
			return v.sessionId;
		});
	if (sessionsIds.length === 0) {
		return null;
	}

	const sessionId = sessionsIds[Math.floor(Math.random() * sessionsIds.length)];
	invariant(sessionId != null, "sessionId cannot be null");
	return sessionId;
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
