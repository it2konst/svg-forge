/**
 * Size of the text after gzip, the way a web server would usually send it.
 * Uses the browser's built-in CompressionStream: no library, and the
 * compression itself runs off the JavaScript thread.
 */
export async function gzipSize(text: string): Promise<number> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))
  const compressed = await new Response(stream).arrayBuffer()
  return compressed.byteLength
}
