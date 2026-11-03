<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { createCodeView } from '@/editor/codeView'

/**
 * Read-only markup with syntax highlighting, line numbers and search (Ctrl+F).
 * CodeMirror renders text, never HTML, so this is safe for any input.
 * The component is loaded on demand: CodeMirror is not in the main bundle.
 */
const props = defineProps<{ markup: string; label: string }>()

const { locale } = useI18n()
const host = useTemplateRef<HTMLDivElement>('host')
let codeView: ReturnType<typeof createCodeView> | null = null

onMounted(() => {
  if (!host.value) return
  codeView = createCodeView({
    parent: host.value,
    doc: props.markup,
    label: props.label,
    locale: locale.value,
  })
})

watch(
  () => props.markup,
  (markup) => codeView?.setDoc(markup),
)

watch([locale, () => props.label], ([nextLocale, nextLabel]) =>
  codeView?.setLocale(nextLocale, nextLabel),
)

onBeforeUnmount(() => {
  codeView?.destroy()
  codeView = null
})
</script>

<template>
  <div ref="host" class="markup-view" />
</template>

<style scoped>
.markup-view {
  position: absolute;
  inset: 0;
}
</style>
