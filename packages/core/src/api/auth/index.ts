import { D1Database } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

function createAuth(db?: D1Database) {
  return betterAuth({
    emailAndPassword: {
      enabled: true,
    },
    rateLimit: {
      enabled: true,
    },
    ...(db
      ? {}
      : {
          database: drizzleAdapter({} as D1Database, {
            provider: "sqlite",
          }),
        }),
  });
}

export const auth = createAuth();

export { createAuth };
