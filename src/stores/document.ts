import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import { byteLength } from '@/utils/svg'

export type DocumentSource = 'file' | 'paste' | 'demo'

export interface SvgDocument {
  name: string
  source: DocumentSource
  /** Validated, normalized markup as loaded. Never modified by the optimizer. */
  markup: string
  bytes: number
  loadedAt: number
}

/** The SVG currently open in the editor. */
export const useDocumentStore = defineStore('document', () => {
  // shallowRef: the markup can be megabytes; deep reactivity would only cost time.
  const current = shallowRef<SvgDocument | null>(null)

  const hasDocument = computed(() => current.value !== null)

  function load(markup: string, name: string, source: DocumentSource) {
    current.value = { name, source, markup, bytes: byteLength(markup), loadedAt: Date.now() }
  }

  function close() {
    current.value = null
  }

  return { current, hasDocument, load, close }
})
