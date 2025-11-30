import alchemy from "alchemy";
import {
	Ai,
	BrowserRendering,
	D1Database,
	R2Bucket,
	Vite,
	Worker,
	Workflow,
} from "alchemy/cloudflare";
import { Exec } from "alchemy/os";
import { config } from "dotenv";
import type {
	ExtractRecipeFromPDFParams,
	ExtractRecipeFromUrlParams,
} from "./apps/server/src/workflows";

config({ path: "./.env" });
config({ path: "./apps/web/.env" });
config({ path: "./apps/server/.env" });

const app = await alchemy("fusilli");

await Exec("db-generate", {
	cwd: "packages/db",
	command: "bun run db:generate",
});

const db = await D1Database("database", {
	migrationsDir: "packages/db/src/migrations",
});

export const web = await Vite("web", {
	cwd: "apps/web",
	assets: "dist",
	bindings: {
		VITE_SERVER_URL: process.env.VITE_SERVER_URL || "",
	},
	dev: {
		command: "bun run dev",
	},
});

const bucket = await R2Bucket("recipe-files", {
	name: "recipe-files",
});

export const server = await Worker("server", {
	cwd: "apps/server",
	entrypoint: "src/index.ts",
	compatibility: "node",
	bindings: {
		DB: db,
		BUCKET: bucket,
		AI: Ai(),
		BROWSER: BrowserRendering(),
		EXTRACT_RECIPE_FROM_URL_WORKFLOW: Workflow<ExtractRecipeFromUrlParams>(
			"extract-recipe-from-url",
			{
				workflowName: "extract-recipe-from-url",
				className: "ExtractRecipeFromUrlWorkflow",
			},
		),
		EXTRACT_RECIPE_FROM_PDF_WORKFLOW: Workflow<ExtractRecipeFromPDFParams>(
			"extract-recipe-from-pdf",
			{
				workflowName: "extract-recipe-from-pdf",
				className: "ExtractRecipeFromPDFWorkflow",
			},
		),
		CORS_ORIGIN: process.env.CORS_ORIGIN || "",
		BETTER_AUTH_SECRET: alchemy.secret(process.env.BETTER_AUTH_SECRET),
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "",
		OPENROUTER_API_KEY: alchemy.secret(process.env.OPENROUTER_API_KEY),
	},
	dev: {
		port: 3000,
	},
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
