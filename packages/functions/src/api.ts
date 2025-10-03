import { Hono } from "hono";
import { API } from "@kochbuch/core/api";

const app = new Hono();

app.route("/api", API.app);

export default app;
