<script setup lang="ts">
/**
 * Plain, read-only view of the markup. Text interpolation escapes everything,
 * so this is safe for any input. Syntax highlighting (CodeMirror) comes later.
 */
defineProps<{ markup: string; label: string }>()
</script>

<template>
  <pre class="markup-view" tabindex="0" :aria-label="label"><code>{{ markup }}</code></pre>
</template>

<style scoped>
.markup-view {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 16px 20px;
  overflow: auto;
  font-family: var(--app-font-mono);
  font-size: 0.8125rem;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere; /* minified SVG is often one very long line */
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}
.markup-view:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
}
</style>
