import { type MaybeRefOrGetter, onScopeDispose, ref, toValue, watch } from 'vue'
import { normalizeSvgMarkup } from '@/utils/svg'

/**
 * A blob: URL for showing SVG markup in an <img>, kept in sync with the markup.
 *
 * An SVG loaded as an image is sandboxed by the browser: scripts and event handlers
 * never run and external resources never load. Never use v-html for user SVG.
 *
 * The markup is normalized for display only: an <img> shows nothing for SVG without
 * xmlns, which is exactly what the "Remove xmlns" plugin produces for inline use.
 * The downloaded and copied result stays untouched.
 */
export function useSvgBlobUrl(markup: MaybeRefOrGetter<string | null | undefined>) {
  const url = ref<string>()

  function release() {
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = undefined
  }

  watch(
    () => toValue(markup),
    (text) => {
      release() // free the previous blob, or every change would leak memory
      if (text) {
        const displayable = normalizeSvgMarkup(text)
        url.value = URL.createObjectURL(new Blob([displayable], { type: 'image/svg+xml' }))
      }
    },
    { immediate: true },
  )

  onScopeDispose(release)

  return url
}
