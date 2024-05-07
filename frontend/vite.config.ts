import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server: {
    proxy: {
      "/api": "http://localhost:8000",
      "/backend": "http://localhost:8000",
    },
  },
  plugins: [react()],
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, "./src")}]
  },
  optimizeDeps: {
    exclude: []
  }
});
