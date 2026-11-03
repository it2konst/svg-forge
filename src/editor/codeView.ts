/**
 * CodeMirror 6 setup for the read-only markup view.
 *
 * Only the pieces we need are imported (no basicSetup bundle). Colors come from
 * Vuetify's CSS variables, so the editor follows the app theme without being rebuilt.
 */
import { defaultKeymap, selectAll } from '@codemirror/commands'
import { xml } from '@codemirror/lang-xml'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { highlightSelectionMatches, search, searchKeymap } from '@codemirror/search'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import { drawSelection, EditorView, keymap, lineNumbers } from '@codemirror/view'
import { tags } from '@lezer/highlight'

const themeColor = (name: string, alpha?: number) =>
  alpha === undefined ? `rgb(var(--v-theme-${name}))` : `rgba(var(--v-theme-${name}), ${alpha})`

const highlightStyle = HighlightStyle.define([
  { tag: tags.tagName, color: themeColor('code-tag') },
  { tag: tags.attributeName, color: themeColor('code-attr') },
  { tag: tags.attributeValue, color: themeColor('code-value') },
  {
    tag: [tags.comment, tags.blockComment],
    color: themeColor('code-comment'),
    fontStyle: 'italic',
  },
  { tag: [tags.angleBracket, tags.definitionOperator], color: themeColor('code-punct') },
  {
    tag: [tags.processingInstruction, tags.documentMeta, tags.character],
    color: themeColor('code-meta'),
  },
  { tag: tags.invalid, color: themeColor('error') },
])

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '0.8125rem',
    color: themeColor('on-surface'),
    backgroundColor: themeColor('surface'),
  },
  '.cm-scroller': {
    fontFamily: 'var(--app-font-mono)',
    lineHeight: '1.65',
  },
  '.cm-content': { padding: '12px 0', caretColor: themeColor('primary') },
  '.cm-line': { padding: '0 16px 0 8px' },
  '.cm-gutters': {
    backgroundColor: themeColor('surface'),
    color: themeColor('on-surface', 0.4),
    border: 'none',
  },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 4px 0 16px' },
  '&.cm-focused': { outline: `2px solid ${themeColor('primary')}`, outlineOffset: '-2px' },
  '.cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground':
    { backgroundColor: themeColor('primary', 0.22) },
  '.cm-selectionMatch': { backgroundColor: themeColor('primary', 0.14) },
  '.cm-searchMatch': {
    backgroundColor: themeColor('warning', 0.25),
    outline: `1px solid ${themeColor('warning', 0.6)}`,
  },
  '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: themeColor('warning', 0.45) },
  '.cm-panels': {
    backgroundColor: themeColor('surface-light'),
    color: themeColor('on-surface'),
  },
  '.cm-panels.cm-panels-top': { borderBottom: `thin solid ${themeColor('on-surface', 0.12)}` },
  '.cm-panel.cm-search': {
    padding: '8px 36px 8px 12px',
    fontFamily: 'inherit',
    fontSize: '0.8125rem',
  },
  '.cm-panel.cm-search label': { fontSize: 'inherit' },
  '.cm-panel.cm-search input, .cm-panel.cm-search button': { fontFamily: 'inherit' },
  '.cm-textfield': {
    color: 'inherit',
    backgroundColor: themeColor('surface'),
    border: `thin solid ${themeColor('on-surface', 0.24)}`,
    borderRadius: '6px',
    padding: '3px 8px',
    fontSize: 'inherit',
  },
  '.cm-button': {
    padding: '3px 10px',
    fontSize: 'inherit',
    color: 'inherit',
    backgroundImage: 'none',
    backgroundColor: themeColor('surface'),
    border: `thin solid ${themeColor('on-surface', 0.24)}`,
    borderRadius: '6px',
  },
})

/** Russian labels for the search panel; English is CodeMirror's default. */
const PHRASES: Record<string, Record<string, string>> = {
  ru: {
    Find: 'Найти',
    Replace: 'Заменить',
    next: 'далее',
    previous: 'назад',
    all: 'все',
    'match case': 'с учётом регистра',
    regexp: 'регулярное выражение',
    'by word': 'слово целиком',
    close: 'закрыть',
    replace: 'заменить',
    'replace all': 'заменить все',
    'Go to line': 'Перейти к строке',
    go: 'перейти',
    'current match': 'текущее совпадение',
    'on line': 'в строке',
  },
}

export function phrasesFor(locale: string): Extension {
  return EditorState.phrases.of(PHRASES[locale] ?? {})
}

export interface CodeViewOptions {
  parent: HTMLElement
  doc: string
  label: string
  locale: string
}

/** Creates the read-only editor. Returns helpers to update it from Vue. */
export function createCodeView({ parent, doc, label, locale }: CodeViewOptions) {
  const phrases = new Compartment()
  const contentLabel = new Compartment()

  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc,
      extensions: [
        // Read-only but focusable: the cursor, selection, Ctrl+A and Ctrl+F all work.
        EditorState.readOnly.of(true),
        lineNumbers(),
        drawSelection(),
        EditorView.lineWrapping, // minified SVG is often one very long line
        xml(),
        syntaxHighlighting(highlightStyle),
        search({ top: true }),
        highlightSelectionMatches(),
        keymap.of([...searchKeymap, { key: 'Mod-a', run: selectAll }, ...defaultKeymap]),
        editorTheme,
        phrases.of(phrasesFor(locale)),
        contentLabel.of(EditorView.contentAttributes.of({ 'aria-label': label })),
      ],
    }),
  })

  return {
    setDoc(next: string) {
      if (next === view.state.doc.toString()) return
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } })
    },
    setLocale(nextLocale: string, nextLabel: string) {
      view.dispatch({
        effects: [
          phrases.reconfigure(phrasesFor(nextLocale)),
          contentLabel.reconfigure(EditorView.contentAttributes.of({ 'aria-label': nextLabel })),
        ],
      })
    },
    destroy() {
      view.destroy()
    },
  }
}
