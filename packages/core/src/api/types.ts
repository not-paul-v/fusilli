import { D1Database } from "@cloudflare/workers-types";
import { DrizzleDatabase } from "@/db/types";

// db binding set in sst config
export type Bindings = {
  DB: D1Database;
};

// db client set by db middleware
export type Variables = {
  db: DrizzleDatabase;
};
