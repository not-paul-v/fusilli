import { env } from "cloudflare:workers";
import type { Recipe } from "@fusilli/db";
import { Hono } from "hono";
import invariant from "tiny-invariant";
import { match } from "ts-pattern";
import { authMiddleware } from "@/middleware/auth";

type WorkflowResponse =
	| {
			status: "error";
			message: string;
	  }
	| {
			status: "success";
			recipe: Recipe;
	  }
	| {
			status: "running";
			__LOCAL_DEV_STEP_OUTPUTS?: unknown;
	  };

export const workflowRoutes = new Hono()
	.use(authMiddleware)
	.get("/:workflowId", async (c) => {
		const workflow = await env.EXTRACT_RECIPE_FROM_URL_WORKFLOW.get(
			c.req.param("workflowId"),
		);
		const workflowStatus = await workflow.status();

		const response = match<InstanceStatus, WorkflowResponse>(workflowStatus)
			.with({ status: "errored" }, () => ({
				status: "error",
				message: workflowStatus.error ?? "Something went wrong",
			}))
			.with({ status: "complete" }, () => {
				invariant(
					workflowStatus.output != null,
					"A successful workflow must return the recipe",
				);
				return {
					status: "success",
					recipe: workflowStatus.output as Recipe,
				};
			})
			.otherwise(() => ({
				status: "running",
				// @ts-expect-error __LOCAL_DEV_STEP_OUTPUTS is not typed since it only exists in dev env
				__LOCAL_DEV_STEP_OUTPUTS: workflowStatus.__LOCAL_DEV_STEP_OUTPUTS,
			}));
		return c.json(response);
	});
