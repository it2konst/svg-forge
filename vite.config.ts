import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { defineConfig } from 'vite'

const svgoPackage = JSON.parse(
  readFileSync(new URL('./node_modules/svgo/package.json', import.meta.url), 'utf8'),
) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  define: {
    // Shown in the UI; read at build time so SVGO itself stays out of the main bundle.
    __SVGO_VERSION__: JSON.stringify(svgoPackage.version),
  },
  plugins: [
    vue(),
    // Imports only the Vuetify components that are actually used (tree-shaking).
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
