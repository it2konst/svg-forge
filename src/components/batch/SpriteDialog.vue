<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import CodeOutput from '@/components/export/CodeOutput.vue'
import { useSvgBlobUrl } from '@/composables/useSvgBlobUrl'
import { buildSprite, type SpriteMode, spritePreview, spriteUsage } from '@/export/sprite'
import { iconClose } from '@/icons'
import { useBatchStore } from '@/stores/batch'

/** All optimized files of the batch as one SVG sprite, with a preview and usage code. */
const open = defineModel<boolean>({ required: true })

const { t } = useI18n()
const { xs } = useDisplay()
const batch = useBatchStore()

const mode = ref<SpriteMode>('file')
const modes: SpriteMode[] = ['file', 'inline']

// Built only while the dialog is open: v-dialog renders its content lazily.
const sprite = computed(() =>
  buildSprite(
    batch.done.flatMap((item) =>
      item.result ? [{ name: item.name, markup: item.result.markup }] : [],
    ),
    mode.value,
  ),
)
const usage = computed(() => spriteUsage(sprite.value.symbols, mode.value))
const preview = useSvgBlobUrl(() =>
  sprite.value.symbols.length ? spritePreview(sprite.value) : null,
)
</script>

<template>
  <v-dialog v-model="open" max-width="860" :fullscreen="xs" scrollable>
    <v-card rounded="xl" @keydown.esc.stop="open = false">
      <v-card-title class="d-flex align-center">
        <span>{{ t('sprite.title') }}</span>
        <v-spacer />
        <v-btn icon size="small" :aria-label="t('exportCode.close')" @click="open = false">
          <v-icon :icon="iconClose" />
        </v-btn>
      </v-card-title>
      <v-divider />

      <v-card-text class="pt-4">
        <p class="sprite__intro">{{ t(`sprite.intro.${mode}`) }}</p>

        <v-btn-toggle
          v-model="mode"
          mandatory
          density="compact"
          rounded="lg"
          variant="outlined"
          divided
          :aria-label="t('sprite.mode')"
          class="mb-4"
        >
          <v-btn v-for="option in modes" :key="option" :value="option" size="small">
            {{ t(`sprite.modes.${option}`) }}
          </v-btn>
        </v-btn-toggle>

        <p v-if="sprite.skipped.length" class="sprite__warning" role="status">
          {{ t('sprite.skipped', { names: sprite.skipped.join(', ') }) }}
        </p>

        <h3 class="sprite__heading">
          {{ t('sprite.icons', sprite.symbols.length) }}
        </h3>
        <div class="sprite__preview">
          <img
            v-if="preview"
            :src="preview"
            :alt="t('sprite.previewAlt', { count: sprite.symbols.length })"
          />
        </div>
        <ul class="sprite__ids" :aria-label="t('sprite.ids')">
          <li v-for="symbol in sprite.symbols" :key="symbol.id" :title="symbol.name">
            #{{ symbol.id }}
          </li>
        </ul>

        <h3 class="sprite__heading">{{ t('sprite.code') }}</h3>
        <CodeOutput
          :code="sprite.code"
          :label="t('sprite.code')"
          :file-name="mode === 'file' ? 'sprite.svg' : undefined"
          mime-type="image/svg+xml"
        />

        <h3 class="sprite__heading">{{ t('sprite.usage') }}</h3>
        <CodeOutput :code="usage" :label="t('sprite.usage')" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.sprite__intro {
  margin: 0 0 12px;
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.sprite__warning {
  margin: 0 0 12px;
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-warning));
}
.sprite__heading {
  margin: 20px 0 8px;
  font-size: 0.9375rem;
  font-weight: 650;
}
.sprite__preview {
  padding: 8px;
  border-radius: 10px;
  overflow-x: auto;
  background: repeating-conic-gradient(
      rgb(var(--v-theme-checker-a)) 0 25%,
      rgb(var(--v-theme-checker-b)) 0 50%
    )
    0 0 / 14px 14px;
}
.sprite__preview img {
  display: block;
  max-width: 100%;
  height: auto;
}
.sprite__ids {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}
.sprite__ids li {
  padding: 2px 8px;
  border-radius: 6px;
  font-family: var(--app-font-mono);
  font-size: 0.75rem;
  background: rgb(var(--v-theme-surface-light));
}
</style>
