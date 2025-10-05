import { Resource } from "sst";
import { api } from "./api";

export const staticSite = new sst.cloudflare.StaticSite("StaticSite", {
  path: "packages/web",
  build: {
    command: "bun run build",
    output: "dist",
  },
  environment: {
    VITE_API_BASE_URL: api.url,
  },
});
