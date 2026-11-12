import { useBatchInput } from '@/composables/useBatchInput'
import { useSvgLoader } from '@/composables/useSvgLoader'

/** The parts of the File Handling API we use; not in TypeScript's DOM types yet. */
interface LaunchParams {
  files?: readonly { kind: string; getFile(): Promise<File> }[]
}
interface LaunchQueue {
  setConsumer(consumer: (params: LaunchParams) => void | Promise<void>): void
}

/**
 * Files opened with the installed app ("Open with → svg-forge" in the file manager)
 * arrive through window.launchQueue. One file opens in the editor, several make
 * a batch, the same rules as dropping them on the window.
 * In browsers without the API this does nothing.
 */
export function useFileLaunch() {
  const { loadFile } = useSvgLoader()
  const { addToBatch, shouldBatch } = useBatchInput()

  const launchQueue = (window as Window & { launchQueue?: LaunchQueue }).launchQueue
  launchQueue?.setConsumer(async ({ files }) => {
    const handles = (files ?? []).filter((handle) => handle.kind === 'file')
    if (!handles.length) return
    const opened = await Promise.all(handles.map((handle) => handle.getFile()))
    if (shouldBatch(opened.length)) await addToBatch(opened)
    else await loadFile(opened[0] as File)
  })
}
