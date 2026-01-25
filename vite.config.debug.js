import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  root: "src/options",
  build: {
    outDir: "../../dist-options",
    emptyOutDir: true
  }
});
