import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { mergeWithDefaults, type OptimizerSettings } from '@/optimizer/config'
import { BUILTIN_PRESETS, cloneSettings, sameSettings } from '@/optimizer/presets'
import { useOptimizerStore } from '@/stores/optimizer'

export interface UserPreset {
  id: string
  name: string
  settings: OptimizerSettings
}

export const PRESET_NAME_MAX = 40

/** Which preset the current settings match: a built-in id, a user preset id, or null. */
export type ActivePreset = { kind: 'builtin'; id: string } | { kind: 'user'; id: string } | null

function isUserPreset(value: unknown): value is UserPreset {
  const preset = value as UserPreset
  return (
    typeof preset?.id === 'string' &&
    typeof preset.name === 'string' &&
    typeof preset.settings === 'object' &&
    preset.settings !== null
  )
}

/** Built-in presets plus the user's own, saved in localStorage. */
export const usePresetsStore = defineStore('presets', () => {
  const optimizer = useOptimizerStore()

  const userPresets = useStorage<UserPreset[]>('svg-forge:presets', [], undefined, {
    // Drop anything malformed and fill in settings added in later versions.
    mergeDefaults: (stored) =>
      (Array.isArray(stored) ? stored : []).filter(isUserPreset).map((preset) => ({
        ...preset,
        settings: mergeWithDefaults(preset.settings),
      })),
  })

  const active = computed<ActivePreset>(() => {
    const current = optimizer.settings
    const builtin = BUILTIN_PRESETS.find((preset) => sameSettings(preset.create(), current))
    if (builtin) return { kind: 'builtin', id: builtin.id }
    const user = userPresets.value.find((preset) => sameSettings(preset.settings, current))
    return user ? { kind: 'user', id: user.id } : null
  })

  function applyBuiltin(id: string) {
    const preset = BUILTIN_PRESETS.find((p) => p.id === id)
    if (preset) optimizer.settings = preset.create()
  }

  function applyUser(id: string) {
    const preset = userPresets.value.find((p) => p.id === id)
    if (preset) optimizer.settings = cloneSettings(preset.settings)
  }

  /** Saves the current settings. A preset with the same name is updated instead. */
  function saveCurrent(rawName: string): 'created' | 'updated' {
    const name = rawName.trim().slice(0, PRESET_NAME_MAX)
    const settings = cloneSettings(optimizer.settings)
    const existing = findByName(name)
    if (existing) {
      existing.settings = settings
      return 'updated'
    }
    userPresets.value.push({ id: crypto.randomUUID(), name, settings })
    return 'created'
  }

  function remove(id: string): UserPreset | undefined {
    const preset = userPresets.value.find((p) => p.id === id)
    userPresets.value = userPresets.value.filter((p) => p.id !== id)
    return preset
  }

  function findByName(name: string): UserPreset | undefined {
    const key = name.trim().toLocaleLowerCase()
    return userPresets.value.find((preset) => preset.name.toLocaleLowerCase() === key)
  }

  return { userPresets, active, applyBuiltin, applyUser, saveCurrent, remove, findByName }
})
