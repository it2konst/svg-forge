import { useSvgErrors } from '@/composables/useSvgErrors'
import { type DocumentSource, useDocumentStore } from '@/stores/document'
import { prepareSvgMarkup, readSvgFile } from '@/utils/svg'

/** null on success, otherwise the translated reason it failed. */
export type LoadError = string | null

/**
 * The single entry point for getting an SVG into the app,
 * whatever the source: file dialog, drag and drop, paste or demo.
 * Every path goes through the same validation and error messages.
 */
export function useSvgLoader() {
  const documentStore = useDocumentStore()
  const { messageFor, reportError } = useSvgErrors()

  async function loadFile(file: File): Promise<boolean> {
    try {
      documentStore.load(await readSvgFile(file), file.name, 'file')
      return true
    } catch (error) {
      reportError(error)
      return false
    }
  }

  /** Loads markup; on failure shows the reason in a snackbar. */
  function loadText(text: string, name: string, source: DocumentSource): boolean {
    try {
      documentStore.load(prepareSvgMarkup(text), name, source)
      return true
    } catch (error) {
      reportError(error)
      return false
    }
  }

  /** Like loadText, but returns the reason instead of showing it (for inline form errors). */
  function tryLoadText(text: string, name: string, source: DocumentSource): LoadError {
    try {
      documentStore.load(prepareSvgMarkup(text), name, source)
      return null
    } catch (error) {
      return messageFor(error)
    }
  }

  return { loadFile, loadText, tryLoadText }
}
