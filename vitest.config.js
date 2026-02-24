import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default defineConfig((configEnv) =>
  mergeConfig(
    typeof viteConfig === 'function' ? viteConfig(configEnv) : viteConfig,
    defineConfig({
      test: {
        environment: 'happy-dom',
        exclude: ['**/node_modules/**', '**/dist/**']
      }
    })
  )
)
