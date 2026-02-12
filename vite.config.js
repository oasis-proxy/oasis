import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./src/manifest.json";
import { resolve } from "path";

import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    crx({ manifest }),
    viteStaticCopy({
      targets: [
        {
          src: 'src/_locales',
          dest: ''
        }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        monitor: resolve(__dirname, "src/monitor/index.html"),
      },
    },
  },
});
