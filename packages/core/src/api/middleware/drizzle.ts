import { createMiddleware } from "hono/factory";
import { Bindings, Variables } from "../types";
import { getDrizzleClient } from "@/db/client";

export const drizzleMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const drizzle = getDrizzleClient(c.env.DB);
  c.set("db", drizzle);
  return next();
});
