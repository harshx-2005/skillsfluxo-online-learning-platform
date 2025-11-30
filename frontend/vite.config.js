import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // Required for Railway preview environment
    port: 5173,        // Local dev port
  },
  build: {
    outDir: "dist",    // Default but safe to include
  }
});