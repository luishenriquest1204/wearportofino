import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Pure frontend: relative base so the build can be opened from any static host.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: { assetsInlineLimit: 0, chunkSizeWarningLimit: 900 },
});
