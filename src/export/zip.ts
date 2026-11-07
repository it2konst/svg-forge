import { strToU8, zipSync } from 'fflate'

export interface ZipEntry {
  name: string
  text: string
}

/**
 * Makes file names unique the way file managers do:
 * icon.svg, icon (2).svg, icon (3).svg. Case-insensitive, because most
 * file systems people unzip onto are.
 */
export function uniqueNames(names: readonly string[]): string[] {
  const used = new Set<string>()
  return names.map((name) => {
    const dot = name.lastIndexOf('.')
    const stem = dot > 0 ? name.slice(0, dot) : name
    const extension = dot > 0 ? name.slice(dot) : ''

    let candidate = name
    for (let n = 2; used.has(candidate.toLowerCase()); n++) {
      candidate = `${stem} (${n})${extension}`
    }
    used.add(candidate.toLowerCase())
    return candidate
  })
}

/** Packs text files into a zip archive. Names are made unique; folders are flattened. */
export function zipTextFiles(entries: readonly ZipEntry[]): Uint8Array {
  const flat = entries.map((entry) => entry.name.split(/[\\/]/).pop() || 'file.svg')
  const names = uniqueNames(flat)
  const files: Record<string, Uint8Array> = {}
  entries.forEach((entry, index) => {
    files[names[index] as string] = strToU8(entry.text)
  })
  return zipSync(files)
}
