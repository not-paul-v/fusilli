import { env } from "cloudflare:workers";
import { auth } from "@fusilli/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { db, recipe } from "@fusilli/db";

export * from "./workflows";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

app.get("/workflows/:workflowId", async (c) => {
  const workflow = await env.EXTRACT_RECIPE_WORKFLOW.get(
    c.req.param("workflowId"),
  );
  const status = await workflow.status();
  return c.json({
    id: workflow.id,
    status,
  });
});

app.get("/test", async (c) => {
  const res = await db.insert(recipe).values({
    name: "yee",
    description: "haw",
    originUrl: "",
    slug: "yee-haw",
  });

  return c.json({ res });
});

app.get(
  "/recipes/from-link",
  zValidator(
    "query",
    z.object({
      url: z.url(),
    }),
  ),
  async (c) => {
    const instance = await env.EXTRACT_RECIPE_WORKFLOW.create({
      params: {
        url: c.req.valid("query").url,
      },
    });

    return c.json({
      id: instance.id,
      details: await instance.status(),
    });
  },
);

const api = new Hono();
api.route("/api", app);

export default api;
