import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import invariant from "tiny-invariant";
import { authRoutes } from "./routes/auth";
import { ingredientRoutes } from "./routes/ingredients";
import { recipeRoutes } from "./routes/recipe";
import { workflowRoutes } from "./routes/workflow";

export * from "./workflows";

const api = new Hono()
	.route("/auth", authRoutes)
	.route("/recipes", recipeRoutes)
	.route("/workflows", workflowRoutes)
	.route("/ingredients", ingredientRoutes);

invariant(
	env.CORS_ORIGIN && env.CORS_ORIGIN.length > 0,
	"CORS_ORIGIN environment variable must be set",
);

const app = new Hono()
	.use(logger())
	.use(
		"/*",
		cors({
			origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
			allowMethods: ["GET", "POST", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.route("/api", api);

export default app;
export type AppType = typeof app;
