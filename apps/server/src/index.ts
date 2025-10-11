import { env } from "cloudflare:workers";
import { auth } from "@kochbuch/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

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

app.get("/", (c) => {
  return c.json({ mesasge: "hello" });
});

app.get(
  "/text-contents",
  zValidator(
    "query",
    z.object({
      url: z.url(),
    }),
  ),
  async (c) => {
    const url = c.req.valid("query").url;
    console.log("calling scraper");
    const textContent = await env.SCRAPER.getTextContentOfPage(url);
    return c.json(textContent);
  },
);

const api = new Hono();
api.route("/api", app);

export default api;
