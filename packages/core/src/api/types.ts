import { D1Database } from "@cloudflare/workers-types";
import { DrizzleDatabase } from "@/db/types";
import { auth } from "./auth";

// db binding set in sst config
export type Bindings = {
  DB: D1Database;
};

// db client set by db middleware
export type Variables = {
  db: DrizzleDatabase;
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

export type Env = {
  OPENROUTER_TOKEN: string;
  BETTER_AUTH_SECRET: string;
};
