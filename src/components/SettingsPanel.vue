<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PrecisionSlider from '@/components/PrecisionSlider.vue'
import { iconReset } from '@/icons'
import { PRECISION_MAX, PRECISION_MIN, isPluginEnabled } from '@/optimizer/config'
import { PLUGIN_GROUPS, PLUGINS } from '@/optimizer/plugins'
import { useNotificationsStore } from '@/stores/notifications'
import { useOptimizerStore } from '@/stores/optimizer'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'

/** Right-hand panel: global SVGO options and one switch per plugin, grouped. */
const { t } = useI18n()
const optimizer = useOptimizerStore()
const appSettings = useSettingsStore()
const ui = useUiStore()
const notifications = useNotificationsStore()

const svgoVersion = __SVGO_VERSION__

const groups = computed(() =>
  PLUGIN_GROUPS.map((group) => {
    const plugins = PLUGINS.filter((plugin) => plugin.group === group)
    const enabled = plugins.filter((plugin) => isPluginEnabled(optimizer.settings, plugin.id))
    return { group, plugins, enabledCount: enabled.length }
  }),
)

function setPlugin(id: string, value: boolean | null) {
  optimizer.settings.plugins[id] = value === true
}

function reset() {
  optimizer.resetSettings()
  ui.showOriginal = false
  notifications.notify(t('settings.resetDone'), 'success')
}
</script>

<template>
  <div class="settings-panel">
    <div class="settings-panel__header">
      <h2 class="settings-panel__title">{{ $t('settings.title') }}</h2>
      <v-btn :prepend-icon="iconReset" size="small" @click="reset">
        {{ $t('settings.reset') }}
      </v-btn>
    </div>

    <section class="settings-panel__section" aria-labelledby="settings-global">
      <h3 id="settings-global" class="settings-panel__heading">{{ $t('settings.global') }}</h3>

      <v-switch
        v-model="ui.showOriginal"
        :label="$t('settings.showOriginal')"
        class="settings-switch"
        color="primary"
        density="compact"
        hide-details
      />
      <v-switch
        v-model="appSettings.compareGzip"
        :label="$t('settings.compareGzip')"
        class="settings-switch"
        color="primary"
        density="compact"
        hide-details
      />
      <v-switch
        v-model="optimizer.settings.multipass"
        :label="$t('settings.multipass')"
        class="settings-switch"
        color="primary"
        density="compact"
        hide-details
      />
      <v-switch
        v-model="optimizer.settings.pretty"
        :label="$t('settings.pretty')"
        class="settings-switch"
        color="primary"
        density="compact"
        hide-details
      />

      <PrecisionSlider
        v-model="optimizer.settings.floatPrecision"
        :label="$t('settings.floatPrecision')"
        :min="PRECISION_MIN"
        :max="PRECISION_MAX"
      />
      <PrecisionSlider
        v-model="optimizer.settings.transformPrecision"
        :label="$t('settings.transformPrecision')"
        :min="PRECISION_MIN"
        :max="PRECISION_MAX"
      />
    </section>

    <v-divider />

    <section class="settings-panel__section" aria-labelledby="settings-optimizations">
      <h3 id="settings-optimizations" class="settings-panel__heading">
        {{ $t('settings.optimizations') }}
      </h3>

      <div
        v-for="{ group, plugins, enabledCount } in groups"
        :key="group"
        class="settings-panel__group"
        role="group"
        :aria-labelledby="`plugin-group-${group}`"
      >
        <div class="settings-panel__group-header">
          <h4 :id="`plugin-group-${group}`" class="settings-panel__group-title">
            {{ $t(`pluginGroups.${group}`) }}
          </h4>
          <span class="settings-panel__count">
            {{ $t('settings.enabledCount', { on: enabledCount, total: plugins.length }) }}
          </span>
        </div>

        <v-switch
          v-for="plugin in plugins"
          :key="plugin.id"
          :model-value="isPluginEnabled(optimizer.settings, plugin.id)"
          :label="$t(`plugins.${plugin.id}`)"
          :title="plugin.id"
          class="settings-switch"
          color="primary"
          density="compact"
          hide-details
          @update:model-value="setPlugin(plugin.id, $event)"
        />
      </div>
    </section>

    <p class="settings-panel__footer">
      <i18n-t keypath="settings.poweredBy" tag="span">
        <template #svgo>
          <a href="https://svgo.dev" target="_blank" rel="noopener noreferrer">SVGO</a>
        </template>
        <template #version>{{ svgoVersion }}</template>
      </i18n-t>
    </p>
  </div>
</template>

<style scoped>
.settings-panel {
  padding: 16px 16px 24px;
}
.settings-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
/* Headings get explicit margins: Vuetify 4 leaves the browser defaults in place. */
.settings-panel__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 650;
}
.settings-panel__section {
  padding-block: 12px;
}
.settings-panel__heading {
  margin: 0 0 4px;
  font-size: 0.9375rem;
  font-weight: 650;
}
.settings-panel__group {
  margin-top: 14px;
}
.settings-panel__group-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}
.settings-panel__group-title {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.settings-panel__count {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
/* Denser switches: 47 of them should not need endless scrolling. */
.settings-switch :deep(.v-selection-control) {
  min-height: 34px;
}
.settings-switch :deep(.v-label) {
  font-size: 0.875rem;
  line-height: 1.3;
  opacity: 1;
}
.settings-panel__footer {
  margin-top: 16px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.settings-panel__footer a {
  color: rgb(var(--v-theme-primary));
}
</style>
