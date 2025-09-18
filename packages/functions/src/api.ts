import { Hono } from "hono";
import { Recipes } from "@kochbuch/core/api";

const app = new Hono();

app.route("/recipes", Recipes.app);

export default app;
