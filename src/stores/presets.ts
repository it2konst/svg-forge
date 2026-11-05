import { defineStore } from 'pinia'
import { computed } from 'vue'
import { BUILTIN_PRESETS, sameSettings } from '@/optimizer/presets'
import { useOptimizerStore } from '@/stores/optimizer'

/** Which preset the current settings match: a built-in id, or null. */
export type ActivePreset = { kind: 'builtin'; id: string } | null

/** Built-in optimizer presets and which one is active. */
export const usePresetsStore = defineStore('presets', () => {
  const optimizer = useOptimizerStore()

  const active = computed<ActivePreset>(() => {
    const builtin = BUILTIN_PRESETS.find((preset) =>
      sameSettings(preset.create(), optimizer.settings),
    )
    return builtin ? { kind: 'builtin', id: builtin.id } : null
  })

  function applyBuiltin(id: string) {
    const preset = BUILTIN_PRESETS.find((p) => p.id === id)
    if (preset) optimizer.settings = preset.create()
  }

  return { active, applyBuiltin }
})
