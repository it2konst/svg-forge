import * as Vue from 'vue'
import { compileScript, compileTemplate, parse } from 'vue/compiler-sfc'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { toVueComponent, type VueExportOptions } from './vue'

const SVG_NS = 'xmlns="http://www.w3.org/2000/svg"'

const options = (overrides: Partial<VueExportOptions> = {}): VueExportOptions => ({
  name: 'TestIcon',
  defaultSize: '24',
  currentColor: false,
  sourceName: 'test.svg',
  ...overrides,
})

/**
 * Compiles the generated SFC with Vue's real compiler and collects every warning.
 * The template's render module is turned into a function, so it can be rendered
 * here without writing files or a bundler.
 */
function compile(code: string) {
  const warnings: string[] = []
  const { descriptor, errors } = parse(code, { filename: 'TestIcon.vue' })
  warnings.push(...errors.map((error) => `parse: ${error.message}`))

  compileScript(descriptor, { id: 'test' })

  const template = compileTemplate({
    id: 'test',
    filename: 'TestIcon.vue',
    source: descriptor.template?.content ?? '',
    compilerOptions: {
      onError: (error) => warnings.push(`template: ${error.message}`),
      onWarn: (warning) => warnings.push(`template: ${warning.message}`),
    },
  })
  warnings.push(...template.errors.map(String))

  const body = template.code
    .replace(
      /^import \{([^}]*)\} from "vue"$/m,
      (_match, names: string) => `const {${names.replace(/ as /g, ': ')}} = Vue`,
    )
    .replace(/^export function render/m, 'return function render')
  const render = new Function('Vue', body)(Vue) as Vue.RenderFunction

  return { warnings, render, script: descriptor.scriptSetup?.content ?? '' }
}

async function renderComponent(code: string, props: Record<string, unknown> = {}) {
  const { render } = compile(code)
  const component = Vue.defineComponent({ props: ['size', 'title'], render })
  return renderToString(Vue.createSSRApp(component, props))
}

describe('toVueComponent', () => {
  const icon = `<svg ${SVG_NS} width="24" height="24" viewBox="0 0 24 24" fill="none"><path stroke="#4a63d8" d="M2 2h20"/></svg>`

  it('compiles with Vue without a single warning', () => {
    const { code } = toVueComponent(icon, options())
    expect(compile(code).warnings).toEqual([])
  })

  it('declares typed size and title props with defaults', () => {
    const { script } = compile(toVueComponent(icon, options()).code)
    expect(script).toContain('size?: number | string')
    expect(script).toContain('title?: string')
    expect(script).toContain('{ size: 24 }')
  })

  it('quotes a CSS length as the default size', () => {
    const { script } = compile(toVueComponent(icon, options({ defaultSize: '1em' })).code)
    expect(script).toContain("{ size: '1em' }")
  })

  it('drops width, height and xmlns from the root and binds the width to size', async () => {
    const html = await renderComponent(toVueComponent(icon, options()).code, { size: 48 })
    expect(html).toMatch(/^<svg viewBox="0 0 24 24" fill="none" width="48"/)
    expect(html).not.toMatch(/height=|xmlns=/)
  })

  it('adds a viewBox from width and height when there is none', () => {
    const { code } = toVueComponent(
      `<svg ${SVG_NS} width="32" height="16"><path d="M0 0"/></svg>`,
      options(),
    )
    expect(code).toContain('viewBox="0 0 32 16"')
  })

  it('is decorative without a title and named with one', async () => {
    const { code } = toVueComponent(icon, options())
    const decorative = await renderComponent(code)
    expect(decorative).toContain('aria-hidden="true"')
    expect(decorative).not.toContain('<title>')

    const named = await renderComponent(code, { title: 'Close' })
    expect(named).toContain('role="img"')
    expect(named).toContain('<title>Close</title>')
    expect(named).not.toContain('aria-hidden')
  })

  it('turns an existing <title> into the default of the title prop', () => {
    const svg = `<svg ${SVG_NS} viewBox="0 0 1 1"><title>Evening "hills" it's</title><path d="M0 0"/></svg>`
    const { code } = toVueComponent(svg, options())
    expect(code).toContain(`title: 'Evening "hills" it\\'s'`)
    expect(code.match(/<title/g)).toHaveLength(1)
  })

  it('keeps mustaches in SVG text as text, not interpolation', async () => {
    const svg = `<svg ${SVG_NS} viewBox="0 0 1 1"><text>Price {{ total }}</text></svg>`
    const html = await renderComponent(toVueComponent(svg, options()).code)
    expect(html).toContain('<text>Price {{ total }}</text>')
  })

  it('renders <style> sheets, which Vue templates would otherwise drop', async () => {
    const svg = `<svg ${SVG_NS} viewBox="0 0 1 1"><style>.a{fill:red}</style><circle class="a" r="1"/></svg>`
    const { code } = toVueComponent(svg, options())
    expect(compile(code).warnings).toEqual([])
    expect(await renderComponent(code)).toContain('<style>.a{fill:red}</style>')
  })

  it('writes one element per line', () => {
    const svg = `<svg ${SVG_NS} viewBox="0 0 1 1"><g><circle r="1"/><rect width="1" height="1"/></g></svg>`
    const template = toVueComponent(svg, options()).code.split('<template>')[1] ?? ''
    expect(template).toContain(
      '\n    <g>\n      <circle r="1" />\n      <rect width="1" height="1" />\n    </g>\n',
    )
  })

  describe('single color', () => {
    const colorful = `<svg ${SVG_NS} viewBox="0 0 1 1" fill="none"><style>.a{fill:#f00;background-color:#fff}</style><defs><linearGradient id="g"><stop stop-color="#0f0"/></linearGradient></defs><path fill="#00f" stroke="url(#g)" style="stroke:#123;opacity:.5" d="M0 0"/></svg>`

    it('counts the distinct colors', () => {
      expect(toVueComponent(colorful, options()).colorCount).toBe(4)
    })

    it('replaces colors with currentColor everywhere, but keeps none and url()', () => {
      const { code } = toVueComponent(colorful, options({ currentColor: true }))
      expect(code).toContain('fill="none"')
      expect(code).toContain('stroke="url(#g)"')
      expect(code).toContain('fill="currentColor"')
      expect(code).toContain('stop-color="currentColor"')
      expect(code).toContain('style="stroke:currentColor;opacity:.5"')
      expect(code).toContain('.a{fill:currentColor;background-color:#fff}')
      expect(code).not.toMatch(/#f00|#00f|#0f0|#123/)
    })

    it('leaves colors alone when switched off', () => {
      const { code } = toVueComponent(colorful, options())
      expect(code).toContain('fill="#00f"')
    })
  })

  it('returns empty code for markup that does not parse', () => {
    expect(toVueComponent('<svg><g></svg>', options())).toEqual({ code: '', colorCount: 0 })
  })
})
