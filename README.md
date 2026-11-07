# svg-forge

[Русская версия](README.ru.md)

[![CI](https://github.com/it2konst/svg-forge/actions/workflows/ci.yml/badge.svg)](https://github.com/it2konst/svg-forge/actions/workflows/ci.yml)

An SVG optimizer that runs entirely in the browser. Drop in an SVG, tune the [SVGO](https://github.com/svg/svgo) options, compare the result and download it. Files are processed on your device and never uploaded anywhere.

Inspired by Jake Archibald's [SVGOMG](https://github.com/jakearchibald/svgomg), written from scratch with Vue 3 and extended with features for front-end work.

![svg-forge in light and dark themes](docs/screenshots/overview.png)

> Work in progress. Everything for a single file works, from opening to exporting as code. Batch processing and sprites come next. See the [roadmap](#roadmap).

## Features

**Ready**

- SVGO 4 runs in a Web Worker, so the interface never freezes; the result updates live as options change
- Global options (multipass, number and transform precision, prettify) and switches for 47 SVGO plugins in five groups, saved between visits
- Optimized size and the size change right in the status bar
- Before / after slider: drag it, click to it or move it with the arrow keys
- "Show original" to switch the whole view to the source
- Export as code: a Vue 3 component (`size` and `title` props, optional single color via `currentColor`), a CSS class (background or recolorable mask) or a data URI (URL-encoded or base64)
- Presets: four built-in (SVGO default, Keep structure, Maximum compression, Inline icons) and your own, saved in the browser
- Scripts and event handlers are removed from the output by default
- Open an SVG from disk (also Ctrl+O), paste markup in a dialog or with Ctrl+V anywhere, or drag and drop a file onto the window
- Demo file to try the app without your own SVG
- Inline SVG copied from HTML works: missing `xmlns` and `xmlns:xlink` are added automatically
- Clear, translated errors for empty input, non-SVG files, broken markup and files over 10 MB
- Safe image preview
- Markup view with syntax highlighting, line numbers and search (CodeMirror 6, loaded on demand)
- Download the result (also Ctrl+S) or copy its markup
- Optional gzip size comparison, measured with the browser's own CompressionStream
- Light, dark and system themes, tuned for long sessions: no pure white or black, softened text contrast
- English and Russian interface; the browser language is picked on first visit
- Preview background independent of the theme: checkerboard, light or dark
- Responsive layout down to phone width
- Strict Content-Security-Policy on deploy

**Planned**

- Batch processing with zip download
- SVG sprite generation
- Offline support (PWA)

## Security

SVG files can contain scripts and event handlers. svg-forge never injects user SVG into the page DOM:

- previews are rendered through `<img src="blob:…">`, where scripts never run and external resources never load;
- `v-html` is forbidden by the lint config;
- incoming markup is parsed with `DOMParser` in XML mode, which never runs scripts, before anything else happens;
- the deployed site sends a strict CSP that only allows scripts from its own origin.

## Tech stack

| Area      | Choice                                                |
| --------- | ----------------------------------------------------- |
| Framework | Vue 3 (Composition API, `<script setup>`), TypeScript |
| Build     | Vite                                                  |
| UI        | Vuetify 4, Material Design Icons as SVG paths         |
| State     | Pinia, VueUse                                         |
| i18n      | vue-i18n, connected to Vuetify through its adapter    |
| Fonts     | Onest and JetBrains Mono, self-hosted via Fontsource  |
| Quality   | ESLint (flat config), Prettier, vue-tsc               |
| Tests     | Vitest with jsdom, GitHub Actions CI                  |
| Optimizer | SVGO 4 in a Web Worker, Comlink                       |
| Code view | CodeMirror 6                                          |
| Hosting   | Vercel                                                |

## Getting started

Requires Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

| Script               | What it does                        |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start the dev server                |
| `npm run build`      | Type-check and build for production |
| `npm run preview`    | Serve the production build locally  |
| `npm run lint`       | Lint and auto-fix                   |
| `npm run format`     | Format `src/` with Prettier         |
| `npm run type-check` | Run vue-tsc                         |
| `npm test`           | Run the unit tests once             |
| `npm run test:watch` | Run tests on every change           |
| `npm run coverage`   | Tests with a coverage report        |

## Project structure

```text
src/
  components/    UI components (header, preview stage, settings panel…)
  composables/   loading SVG (file, paste, drop, demo), errors, theme and language sync
  i18n/          vue-i18n setup and EN/RU messages
  editor/        CodeMirror setup for the markup view
  export/        Vue component, CSS and data URI generators
  optimizer/     SVGO worker, worker client, plugin catalog, settings to SVGO config
  plugins/       Vuetify setup
  stores/        Pinia: current document, optimizer, notifications, settings, UI state
  utils/         SVG validation and normalization, byte formatting
  theme/         light and dark palettes
  icons.ts       every icon the app uses, in one place
```

## Roadmap

1. ~~Load SVG: open file, paste markup, drag and drop, demo file~~ ✓
2. ~~SVGO in a Web Worker, global options and plugin toggles~~ ✓
3. ~~Markup view (CodeMirror), size statistics, download and copy~~ ✓
4. ~~Comparison slider, presets~~ ✓
5. ~~Export to Vue component, data URI, CSS~~ ✓
6. Batch processing and sprites
7. PWA

## License

[MIT](LICENSE)
