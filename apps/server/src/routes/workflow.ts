import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { authMiddleware } from "@/middleware/auth";

export const workflowRoutes = new Hono()
	.use(authMiddleware)
	.get("/:workflowId", async (c) => {
		const workflow = await env.EXTRACT_RECIPE_WORKFLOW.get(
			c.req.param("workflowId"),
		);
		const { status } = await workflow.status();
		return c.json({
			status,
		} as {
			status:
				| "queued"
				| "running"
				| "paused"
				| "errored"
				| "terminated"
				| "complete"
				| "waiting"
				| "waitingForPause"
				| "unknown";
		});
	});
