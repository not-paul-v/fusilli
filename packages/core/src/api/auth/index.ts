import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schemas";
import { DrizzleDatabase } from "@/db/types";
import { Resource } from "sst";

function createAuth(drizzle?: DrizzleDatabase, baseUrl?: string) {
  return betterAuth({
    secret: "test123",
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    rateLimit: {
      enabled: true,
    },
    database: drizzleAdapter(drizzle ?? {}, {
      provider: "sqlite",
      schema,
    }),
    // TODO: hacky work around until static site works properly
    ...(Resource.App.stage === "production"
      ? {}
      : {
          advanced: {
            useSecureCookies: true,
            cookies: {
              session_token: {
                attributes: {
                  sameSite: "none",
                  secure: true,
                },
              },
            },
          },
          trustedOrigins: [
            "localhost:5173",
            // TODO: set dynamically
            // "https://kochbuch-paul-apiscript-mfuevvur.p-viehmann01.workers.dev",
            // TODO: check if this work
            baseUrl ?? "",
          ],
        }),
  });
}

export const auth = createAuth();

export { createAuth };
