import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// Reuses the Vite config, so tests see the same @ alias and build-time constants.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // jsdom gives DOMParser a real XML parser, which the SVG helpers rely on.
      environment: 'jsdom',
      include: ['src/**/*.test.ts'],
      exclude: [...configDefaults.exclude],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        include: ['src/**/*.ts'],
        exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'src/main.ts'],
      },
    },
  }),
)
