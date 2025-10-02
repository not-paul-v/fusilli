export const db = new sst.cloudflare.D1("DB");

new sst.x.DevCommand("Studio", {
  link: [db],
  dev: {
    command: "bunx drizzle-kit studio",
  },
});
