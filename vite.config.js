import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./src/manifest.json";
import { resolve } from "path";
import fs from "fs";
import path from "path";

import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isSelfHosted = process.env.VITE_SELF_HOSTED === 'true';

  if (isSelfHosted) {
    // Inject self-hosted update configuration
    manifest.update_url = "https://example.com/update.xml"; // Replace with your actual update XML URL
    manifest.key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxUoKSSV1+ZbPbKw2QHMPHqNV2wbtpGffrFdtmq9+94o5O6GJq8m7V8dY/lCAIRInfsfG0HaIhA4rxqG/NqUk4MqBRorEhKqmbxG/HcwKaKARAYY7Pj45y/BSoNjkvKFs2lYMmwGJ3HpkPq2IuMIAFO/LWs6m79so8WzxrptvHC9+Yc4+Qn5xPtNlLeCNbP6pjPZ1RRw1E3NGnEn/kHg2asXwUL1fPRcb+lWGgwFYtrv6ZaFkqhNGJPajRFbEMNSeN5zYKD/wQ7J1dOJPim63mTh+mKT7lU0iglxZmLgLnP7VNBCiGWED5QfuPFDcH1K1XIE1n8LT8tv1MqpkOgYZiQIDAQAB";
  }

  return {
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
      }),
      {
        name: 'remove-dot-vite',
        closeBundle() {
          const dotVitePath = path.resolve(__dirname, 'dist/.vite');
          if (fs.existsSync(dotVitePath)) {
            fs.rmSync(dotVitePath, { recursive: true, force: true });
            console.log(`[vite] Removed ${dotVitePath}`);
          }
        }
      }
    ],
    build: {
      rollupOptions: {
        input: {
          monitor: resolve(__dirname, "src/monitor/index.html"),
        },
      },
    },
  };
});

