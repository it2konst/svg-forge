import { useSvgErrors } from '@/composables/useSvgErrors'
import { type DocumentSource, useDocumentStore } from '@/stores/document'
import { prepareSvgMarkup, readSvgFile } from '@/utils/svg'

/**
 * The single entry point for getting an SVG into the app,
 * whatever the source: file dialog, drag and drop, paste or demo.
 * Every path goes through the same validation and error messages.
 */
export function useSvgLoader() {
  const documentStore = useDocumentStore()
  const { reportError } = useSvgErrors()

  async function loadFile(file: File): Promise<boolean> {
    try {
      documentStore.load(await readSvgFile(file), file.name, 'file')
      return true
    } catch (error) {
      reportError(error)
      return false
    }
  }

  function loadText(text: string, name: string, source: DocumentSource): boolean {
    try {
      documentStore.load(prepareSvgMarkup(text), name, source)
      return true
    } catch (error) {
      reportError(error)
      return false
    }
  }

  return { loadFile, loadText }
}
