import { createMiddleware } from "hono/factory";
import { Bindings, Variables } from "../types";
import { databaseClient } from "@/db/client";

export const dbMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const db = databaseClient(c.env.DB);
  c.set("db", db);
  await next();
});
