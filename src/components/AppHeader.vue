<script setup lang="ts">
import { useDisplay } from 'vuetify'
import AppLogo from '@/components/AppLogo.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useInputActions } from '@/composables/useInputActions'
import { iconSettings } from '@/icons'

defineEmits<{ toggleSettings: [] }>()

// On narrow screens the actions collapse to icon buttons.
const { smAndDown, xs } = useDisplay()

const actions = useInputActions()
</script>

<template>
  <v-app-bar flat border="b" density="comfortable" color="surface">
    <div class="app-header__brand">
      <AppLogo />
      <span v-if="!xs" class="app-header__name">{{ $t('app.name') }}</span>
    </div>

    <v-divider vertical inset :class="xs ? 'mx-1' : 'mx-3'" />

    <div class="d-flex" :class="{ 'ga-1': !xs }">
      <template v-for="action in actions" :key="action.key">
        <v-btn
          v-if="smAndDown"
          :icon="action.icon"
          :aria-label="$t(`actions.${action.key}`)"
          @click="action.run()"
        >
          <v-icon :icon="action.icon" />
          <v-tooltip activator="parent">{{ $t(`actions.${action.key}`) }}</v-tooltip>
        </v-btn>
        <v-btn v-else :prepend-icon="action.icon" @click="action.run()">
          {{ $t(`actions.${action.key}`) }}
        </v-btn>
      </template>
    </div>

    <template #append>
      <LanguageSwitcher />
      <ThemeSwitcher />
      <v-btn
        :icon="iconSettings"
        :aria-label="$t('actions.settings')"
        @click="$emit('toggleSettings')"
      />
    </template>
  </v-app-bar>
</template>

<style scoped>
.app-header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-inline-start: 16px;
}
.app-header__name {
  font-size: 1.0625rem;
  font-weight: 650;
  letter-spacing: -0.01em;
}
</style>
