import { createMiddleware } from "hono/factory";
import { auth } from "@fusilli/auth";

export type AuthMiddlewareVariables = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session;
};

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});
