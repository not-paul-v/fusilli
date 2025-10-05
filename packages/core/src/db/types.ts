import * as schema from "@/db/schemas";
import { DrizzleD1Database } from "drizzle-orm/d1";

export type DrizzleDatabase = DrizzleD1Database<typeof schema>;
