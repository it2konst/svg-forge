<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SavePresetDialog from '@/components/SavePresetDialog.vue'
import { iconCheck, iconChevronDown, iconDelete, iconPreset, iconSave } from '@/icons'
import { BUILTIN_PRESETS } from '@/optimizer/presets'
import { useNotificationsStore } from '@/stores/notifications'
import { usePresetsStore } from '@/stores/presets'

/**
 * Built-in presets and the user's own, in one menu.
 * Shows "Custom settings" when the current settings match none of them.
 */
const { t } = useI18n()
const presets = usePresetsStore()
const notifications = useNotificationsStore()

const saveDialogOpen = ref(false)

const activeName = computed(() => {
  const active = presets.active
  if (!active) return t('presets.custom')
  if (active.kind === 'builtin') return t(`presets.builtins.${active.id}.name`)
  return presets.userPresets.find((p) => p.id === active.id)?.name ?? t('presets.custom')
})

const isActive = (kind: 'builtin' | 'user', id: string) =>
  presets.active?.kind === kind && presets.active.id === id

function remove(id: string) {
  const removed = presets.remove(id)
  if (removed) notifications.notify(t('presets.deleted', { name: removed.name }), 'info')
}
</script>

<template>
  <!-- One root, so a class set by the parent lands on it. -->
  <div>
    <v-menu location="bottom start" max-width="320">
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          variant="outlined"
          rounded="lg"
          block
          class="preset-picker"
          :aria-label="`${t('presets.label')}: ${activeName}`"
        >
          <v-icon :icon="iconPreset" start />
          <span class="preset-picker__text">
            <span class="preset-picker__label">{{ t('presets.label') }}</span>
            <span class="preset-picker__name">{{ activeName }}</span>
          </span>
          <v-icon :icon="iconChevronDown" end />
        </v-btn>
      </template>

      <v-list density="compact" class="preset-picker__list">
        <v-list-subheader>{{ t('presets.builtIn') }}</v-list-subheader>
        <v-list-item
          v-for="preset in BUILTIN_PRESETS"
          :key="preset.id"
          :title="t(`presets.builtins.${preset.id}.name`)"
          :subtitle="t(`presets.builtins.${preset.id}.description`)"
          :active="isActive('builtin', preset.id)"
          lines="two"
          @click="presets.applyBuiltin(preset.id)"
        >
          <template v-if="isActive('builtin', preset.id)" #append>
            <v-icon :icon="iconCheck" size="small" />
          </template>
        </v-list-item>

        <template v-if="presets.userPresets.length">
          <v-divider class="my-1" />
          <v-list-subheader>{{ t('presets.yours') }}</v-list-subheader>
          <v-list-item
            v-for="preset in presets.userPresets"
            :key="preset.id"
            :title="preset.name"
            :active="isActive('user', preset.id)"
            @click="presets.applyUser(preset.id)"
          >
            <template #append>
              <v-icon
                v-if="isActive('user', preset.id)"
                :icon="iconCheck"
                size="small"
                class="me-1"
              />
              <v-btn
                icon
                size="x-small"
                variant="text"
                :aria-label="t('presets.delete', { name: preset.name })"
                @click.stop="remove(preset.id)"
              >
                <v-icon :icon="iconDelete" size="small" />
                <v-tooltip activator="parent">{{
                  t('presets.delete', { name: preset.name })
                }}</v-tooltip>
              </v-btn>
            </template>
          </v-list-item>
        </template>

        <v-divider class="my-1" />
        <v-list-item
          :prepend-icon="iconSave"
          :title="t('presets.save')"
          base-color="primary"
          @click="saveDialogOpen = true"
        />
      </v-list>
    </v-menu>

    <SavePresetDialog v-model="saveDialogOpen" />
  </div>
</template>

<style scoped>
.preset-picker {
  height: auto !important;
  min-height: 48px;
  padding-block: 6px;
  justify-content: flex-start;
  text-transform: none;
  border-color: rgba(var(--v-border-color), 0.24);
}
.preset-picker :deep(.v-btn__content) {
  width: 100%;
  justify-content: flex-start;
}
.preset-picker__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: start;
  line-height: 1.25;
}
.preset-picker__label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.preset-picker__name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 600;
}
.preset-picker__list :deep(.v-list-item-subtitle) {
  -webkit-line-clamp: 3;
  line-clamp: 3;
}
</style>
