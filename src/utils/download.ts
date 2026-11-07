/** Saves data as a file through a temporary blob: link. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  // The browser has started the download by now; the URL is no longer needed.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadText(text: string, fileName: string, type: string) {
  downloadBlob(new Blob([text], { type }), fileName)
}
