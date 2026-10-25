import type { ThemeDefinition } from 'vuetify'

/**
 * Two calm themes for long sessions.
 * Rules: no pure white, no pure black; text is softened rather than maximal contrast;
 * dark-theme accents are lighter and less saturated so they don't glow.
 */

export const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#F5F4F0',
    surface: '#FCFBF8',
    'surface-bright': '#FFFFFF',
    'surface-light': '#ECEBE6',
    'surface-variant': '#3A3D44',
    'on-surface-variant': '#ECEDEF',
    'on-background': '#2A2C31',
    'on-surface': '#2A2C31',
    primary: '#4A63D8',
    'on-primary': '#FFFFFF',
    secondary: '#5C6575',
    'on-secondary': '#FFFFFF',
    success: '#2E8B57',
    'on-success': '#FFFFFF',
    warning: '#B26B00',
    'on-warning': '#FFFFFF',
    error: '#C0392B',
    'on-error': '#FFFFFF',
    info: '#2F6FB0',
    'on-info': '#FFFFFF',
    // Preview checkerboard (transparent areas of an SVG)
    'checker-a': '#FFFFFF',
    'checker-b': '#E6E5E0',
  },
  variables: {
    'border-color': '#2A2C31',
    'border-opacity': 0.12,
    'medium-emphasis-opacity': 0.68, // ≈ #6B6F78 on the light background
  },
}

export const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#15171C',
    surface: '#1E2128',
    'surface-bright': '#2A2E37',
    'surface-light': '#262A32',
    'surface-variant': '#C9CDD4',
    'on-surface-variant': '#1E2128',
    'on-background': '#DADDE3',
    'on-surface': '#DADDE3',
    primary: '#8EA2F5',
    'on-primary': '#15171C',
    secondary: '#9AA3B2',
    'on-secondary': '#15171C',
    success: '#6CCB8F',
    'on-success': '#15171C',
    warning: '#E8B365',
    'on-warning': '#15171C',
    error: '#F08A80',
    'on-error': '#15171C',
    info: '#7DB4EA',
    'on-info': '#15171C',
    'checker-a': '#262A32',
    'checker-b': '#1E2128',
  },
  variables: {
    'border-color': '#DADDE3',
    'border-opacity': 0.12,
    'medium-emphasis-opacity': 0.66, // ≈ #9097A3 on the dark background
  },
}
