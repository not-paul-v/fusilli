import { Service } from "@cloudflare/workers-types";

export type Bindings = {
  Scraper: Service;
  RecipeExtraction: Service;
};
