import { authMiddleware } from "@/middleware/auth";
import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { match } from "ts-pattern";

export const workflowRoutes = new Hono()
  .use(authMiddleware)
  .get("/:workflowId", async (c) => {
    const workflow = await env.EXTRACT_RECIPE_WORKFLOW.get(
      c.req.param("workflowId"),
    );
    const { status } = await workflow.status();

    const mappedStatus = match<
      InstanceStatus["status"],
      "errored" | "successful" | "running"
    >(status)
      .with("errored", () => "errored")
      .with("complete", () => "successful")
      .otherwise(() => "running");
    return c.json({
      status: mappedStatus,
    });
  });
