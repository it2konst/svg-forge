<script setup lang="ts">
/** The svg-forge mark: a cubic Bézier with its anchors and control handles. */
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 28"
    :height="size ?? 28"
    viewBox="0 0 32 32"
    aria-hidden="true"
    class="app-logo"
  >
    <rect width="32" height="32" rx="8" class="app-logo__tile" />
    <path
      d="M8 23 13 9m6 14 5-14"
      fill="none"
      stroke-linecap="round"
      stroke-width="1.5"
      class="app-logo__handles"
    />
    <path
      d="M8 23C10 9 22 23 24 9"
      fill="none"
      stroke-linecap="round"
      stroke-width="2.5"
      class="app-logo__curve"
    />
    <g stroke-width="2" class="app-logo__anchors">
      <rect width="5" height="5" x="5.5" y="20.5" rx="1" />
      <rect width="5" height="5" x="21.5" y="6.5" rx="1" />
    </g>
    <g class="app-logo__controls">
      <circle cx="13" cy="9" r="1.75" />
      <circle cx="19" cy="23" r="1.75" />
    </g>
  </svg>
</template>

<style scoped>
.app-logo {
  flex-shrink: 0;
}
.app-logo__tile,
.app-logo__anchors {
  fill: rgb(var(--v-theme-primary));
}
.app-logo__curve,
.app-logo__anchors {
  stroke: rgb(var(--v-theme-on-primary));
}
.app-logo__handles {
  stroke: rgb(var(--v-theme-on-primary));
  opacity: 0.6;
}
.app-logo__controls {
  fill: rgb(var(--v-theme-on-primary));
}
</style>
