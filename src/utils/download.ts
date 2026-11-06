/** Saves text as a file through a temporary blob: link. */
export function downloadText(text: string, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  // The browser has started the download by now; the URL is no longer needed.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
