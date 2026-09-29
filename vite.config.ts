import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "localhost",
    port: 8080,
    strictPort: true,
    hmr: {
      overlay: true,
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(moduleId) {
          if (!moduleId.includes("node_modules")) return undefined;
          if (
            ["react", "react-dom", "react-router-dom"].some((dependency) =>
              moduleId.includes(`/node_modules/${dependency}/`),
            )
          ) {
            return "vendor-react";
          }
          if (moduleId.includes("/node_modules/@tanstack/react-query/")) {
            return "vendor-query";
          }
          if (moduleId.includes("/node_modules/framer-motion/")) {
            return "vendor-motion";
          }
          if (
            ["i18next", "react-i18next"].some((dependency) =>
              moduleId.includes(`/node_modules/${dependency}/`),
            )
          ) {
            return "vendor-i18n";
          }
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
}));
