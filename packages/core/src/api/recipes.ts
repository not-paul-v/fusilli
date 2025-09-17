import { Hono } from "hono";

const app = new Hono().get("/", async (c) => {
  return c.json({ message: "Hello, this is a list of recipes" });
});

export default app;
