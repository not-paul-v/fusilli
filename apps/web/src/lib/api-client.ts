import type { AppType } from "@fusilli/server";
import { hc } from "hono/client";

export const apiClient = hc<AppType>(import.meta.env.VITE_SERVER_URL);
