import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      // GitHub Pages SPA fallback: serve the app for unknown paths like /login
      name: "gh-pages-spa-404",
      apply: "build",
      closeBundle() {
        const out = path.resolve(__dirname, "dist");
        const index = path.join(out, "index.html");
        if (fs.existsSync(index)) fs.copyFileSync(index, path.join(out, "404.html"));
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
