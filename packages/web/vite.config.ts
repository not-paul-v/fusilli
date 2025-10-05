import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  // TODO: temporary work around until static site component works correctly
  plugins: [react(), basicSsl()],
});
