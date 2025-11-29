# Agent Guidelines for Fusilli

## Build & Development
- **Package Manager**: Bun (`bun@1.2.23`)
- **Build**: `bun run build` (turbo monorepo build)
- **Dev**: `bun run dev` (alchemy dev), `bun run dev:web`, `bun run dev:server`
- **Type Check**: `bun run check-types` (turbo for all packages)
- **Lint**: `bun run check` (oxlint)
- **DB**: `bun run db:push`, `bun run db:generate`, `bun run db:studio`

## Code Style
- **Formatting**: Biome with tabs (indentStyle: tab), double quotes
- **Imports**: Auto-organize imports, no unused imports
- **Types**: Use `type` for type-only imports, infer types from Drizzle schemas (`typeof table.$inferSelect`)
- **Naming**: camelCase for variables/functions, PascalCase for classes/types/components
- **Error Handling**: Return error responses with proper status codes (e.g., `c.json({ error: "..." }, 404)`)
- **Async**: Use async/await, avoid floating promises (typescript/no-floating-promises)
- **TypeScript**: No inferrable types, use as const assertions, no parameter reassignment

## Project Structure
- Monorepo with Turbo: `apps/` (server, web) and `packages/` (auth, db)
- Server: Hono + Cloudflare Workers/Workflows, routes in `apps/server/src/routes/`
- Web: React + TanStack Router/Query, Vite + Tailwind 4
- DB: Drizzle ORM with SQLite (libsql), schemas in `packages/db/src/schema/`
