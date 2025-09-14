export const staticSite = new sst.cloudflare.StaticSite("StaticSite", {
  path: "packages/web",
  build: {
    command: "bun run build",
    output: "dist",
  },
  environment: {},
});
