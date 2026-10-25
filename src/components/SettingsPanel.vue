<script setup lang="ts">
/**
 * Right-hand panel for optimizer options.
 * Sections are laid out now; the controls arrive with the SVGO integration.
 */
</script>

<template>
  <div class="settings-panel">
    <h2 class="settings-panel__title">{{ $t('settings.title') }}</h2>

    <section class="settings-panel__section">
      <h3 class="settings-panel__heading">{{ $t('settings.global') }}</h3>
      <p class="settings-panel__pending">{{ $t('settings.pending') }}</p>
    </section>

    <v-divider />

    <section class="settings-panel__section">
      <h3 class="settings-panel__heading">{{ $t('settings.optimizations') }}</h3>
    </section>
  </div>
</template>

<style scoped>
.settings-panel {
  padding: 20px 16px;
}
.settings-panel__title {
  font-size: 1.125rem;
  font-weight: 650;
  margin-bottom: 12px;
}
.settings-panel__section {
  padding-block: 12px;
}
.settings-panel__heading {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 8px;
}
.settings-panel__pending {
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>
