import { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schemas";

export function getDrizzleClient(db: D1Database) {
  return drizzle(db, {
    schema,
  });
}
