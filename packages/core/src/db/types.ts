import * as schema from "../db/schema";
import { DrizzleD1Database } from "drizzle-orm/d1";

export type DrizzleDatabase = DrizzleD1Database<typeof schema>;
