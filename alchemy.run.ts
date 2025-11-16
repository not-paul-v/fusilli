import alchemy from "alchemy";
import { BrowserRendering, Vite } from "alchemy/cloudflare";
import { Worker } from "alchemy/cloudflare";
import { D1Database, Workflow } from "alchemy/cloudflare";
import { Exec } from "alchemy/os";
import { config } from "dotenv";
import type { Params as ExtraceRecipeWorkflowParams } from "./apps/server/src/workflows/extract-recipe";

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

export const server = await Worker("server", {
  cwd: "apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DB: db,
    CORS_ORIGIN: process.env.CORS_ORIGIN || "",
    BETTER_AUTH_SECRET: alchemy.secret(process.env.BETTER_AUTH_SECRET),
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "",
    OPENROUTER_API_KEY: alchemy.secret(process.env.OPENROUTER_API_KEY),
    BROWSER: BrowserRendering(),
    EXTRACT_RECIPE_WORKFLOW: Workflow<ExtraceRecipeWorkflowParams>(
      "extract-recipe",
      {
        workflowName: "extract-recipe",
        className: "ExtractRecipeWorkflow",
      },
    ),
  },
  dev: {
    port: 3000,
  },
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
