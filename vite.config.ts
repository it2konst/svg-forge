import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'
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
    // Installable app that works offline. The service worker precaches the whole
    // build, including the SVGO worker, CodeMirror and the fonts.
    VitePWA({
      // A new version waits for the user to click "Update" instead of reloading
      // the page under them; registration happens in usePwa().
      registerType: 'prompt',
      injectRegister: false,
      // The icons already match globPatterns below; listing them again duplicates them.
      includeManifestIcons: false,
      manifest: {
        id: '/',
        name: 'svg-forge: SVG optimizer',
        short_name: 'svg-forge',
        description:
          'Optimize SVG files in your browser with SVGO. Your files never leave your device.',
        lang: 'en',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#F5F4F0',
        background_color: '#F5F4F0',
        categories: ['developer', 'productivity', 'graphics'],
        // Once installed, svg-forge shows up under "Open with" for .svg files.
        file_handlers: [{ action: '/', accept: { 'image/svg+xml': ['.svg'] } }],
        // Opening more files reuses the window that is already open.
        launch_handler: { client_mode: 'focus-existing' },
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // woff2 only: every browser that runs a service worker reads woff2.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The social preview image is for link crawlers, not for offline use.
        globIgnores: ['og.png'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        // The SVGO worker chunk is large; the default 2 MB limit is close.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
