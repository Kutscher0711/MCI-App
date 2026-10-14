import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BASE_PATH z. B. "/MCI-App/" für GitHub Pages (Unterordner); Standard ist "/".
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  server: {
    proxy: { "/api": "http://localhost:8787" },
  },
});
