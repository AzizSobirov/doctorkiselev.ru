import { defineConfig } from "astro/config";
import viteConfig from "./vite.config.js";

const isProduction = import.meta.env.VITE_MODE == "production";

// https://astro.build/config
export default defineConfig({
  integrations: [],
  output: "static",
  compressHTML: false,
  build: {
    format: isProduction ? "file" : "directory",
    assets: "assets",
  },
  vite: viteConfig,
});
