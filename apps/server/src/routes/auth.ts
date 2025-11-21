import { auth } from "@fusilli/auth";
import { Hono } from "hono";

export const authRoutes = new Hono().on(["POST", "GET"], "/*", (c) =>
  auth.handler(c.req.raw),
);
