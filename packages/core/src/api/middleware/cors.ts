import { createMiddleware } from "hono/factory";
import { cors } from "hono/cors";

export const corsMiddleware = createMiddleware((c, next) => {
  const middleware = cors({
    // TODO: add production origin
    origin: ["http://localhost:5173"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  });
  return middleware(c, next);
});
