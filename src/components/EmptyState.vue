<script setup lang="ts">
import { iconDemo, iconOpen, iconPaste } from '@/icons'
</script>

<template>
  <div class="empty-state">
    <!-- A Bézier curve with its handles: the thing this tool is all about. -->
    <svg class="empty-state__art" viewBox="0 0 240 140" aria-hidden="true">
      <g class="empty-state__handles">
        <line x1="24" y1="116" x2="78" y2="16" />
        <line x1="162" y1="124" x2="216" y2="24" />
      </g>
      <path class="empty-state__curve" d="M24 116C78 16 162 124 216 24" />
      <g class="empty-state__anchors">
        <rect x="16" y="108" width="16" height="16" rx="3" />
        <rect x="208" y="16" width="16" height="16" rx="3" />
      </g>
      <g class="empty-state__controls">
        <circle cx="78" cy="16" r="5" />
        <circle cx="162" cy="124" r="5" />
      </g>
    </svg>

    <h1 class="empty-state__title">{{ $t('empty.title') }}</h1>
    <p class="empty-state__hint">{{ $t('empty.hint') }}</p>

    <div class="empty-state__actions">
      <v-btn :prepend-icon="iconOpen" variant="flat" color="primary" disabled>
        {{ $t('actions.open') }}
      </v-btn>
      <v-btn :prepend-icon="iconPaste" variant="tonal" disabled>
        {{ $t('actions.paste') }}
      </v-btn>
      <v-btn :prepend-icon="iconDemo" variant="text" disabled>
        {{ $t('actions.demo') }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: min(34rem, calc(100% - 32px));
  margin: 16px;
  padding: 36px 28px 32px;
  /* Its own surface keeps the text readable on any preview background. */
  background: rgb(var(--v-theme-surface));
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 20px;
}
.empty-state__art {
  width: min(240px, 60vw);
  margin-bottom: 28px;
  overflow: visible;
}
.empty-state__curve {
  fill: none;
  stroke: rgb(var(--v-theme-primary));
  stroke-width: 4;
  stroke-linecap: round;
}
.empty-state__handles {
  stroke: rgba(var(--v-theme-on-surface), 0.28);
  stroke-width: 1.5;
  stroke-dasharray: 4 5;
}
.empty-state__anchors {
  fill: rgb(var(--v-theme-surface));
  stroke: rgb(var(--v-theme-primary));
  stroke-width: 2.5;
}
.empty-state__controls {
  fill: rgb(var(--v-theme-primary));
}
.empty-state__title {
  font-size: clamp(1.5rem, 1.2rem + 1.2vw, 2rem);
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 8px;
}
.empty-state__hint {
  font-size: 0.9375rem;
  line-height: 1.55;
  max-width: 30rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  margin-bottom: 24px;
}
.empty-state__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}
</style>
