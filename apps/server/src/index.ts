import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { recipeRoutes } from "./routes/recipe";
import { authRoutes } from "./routes/auth";
import { workflowRoutes } from "./routes/workflow";
import { ingredientRoutes } from "./routes/ingredients";

export * from "./workflows";

const api = new Hono()
	.route("/auth", authRoutes)
	.route("/recipes", recipeRoutes)
	.route("/workflows", workflowRoutes)
	.route("/ingredients", ingredientRoutes);

const app = new Hono()
	.use(logger())
	.use(
		"/*",
		cors({
			origin: env.CORS_ORIGIN || "",
			allowMethods: ["GET", "POST", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.route("/api", api);

export default app;
export type AppType = typeof app;
