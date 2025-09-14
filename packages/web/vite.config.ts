import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { livestoreDevtoolsPlugin } from "@livestore/devtools-vite";

// https://vite.dev/config/
export default defineConfig({
  worker: { format: "es" },
  plugins: [
    react(),
    livestoreDevtoolsPlugin({ schemaPath: "./src/livestore/schema.ts" }),
  ],
});
