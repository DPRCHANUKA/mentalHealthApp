import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#243447',
    accent: '#4FA7A0',
    secondary: '#8F88C9',

    background: '#EAF2F3',
    surface: '#E8E5F4',

    text: '#263238',
    textSecondary: '#66727A',

    success: '#4C9A72',
    warning: '#D9A441',
    emergency: '#C94B55',

    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8EEED',
  },

  dark: {
    primary: '#243447',
    accent: '#4FA7A0',
    secondary: '#8F88C9',

    background: '#EAF2F3',
    surface: '#FFFFFF',

    text: '#263238',
    textSecondary: '#66727A',

    success: '#4C9A72',
    warning: '#D9A441',
    emergency: '#C94B55',

    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8EEED',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;