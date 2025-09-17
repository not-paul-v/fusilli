import { Hono } from "hono";
import recipes from "./recipes";

export module Api {
  export function buildApi() {
    const app = new Hono();
    app.route("/recipes", recipes);

    return app;
  }
}
