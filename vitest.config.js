import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'happy-dom',
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
}))
