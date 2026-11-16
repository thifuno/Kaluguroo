import '@/global.css';

import { Platform } from 'react-native';

/**
 * Kaluguroo design tokens.
 * Primary: orange, secondary: white, warm light-gray background.
 */
export const palette = {
  /** Brand orange. Decorative accents only: white text on it is 2.74:1. */
  primary: '#FF7043',
  /** Filled buttons/links with white text (4.73:1) or as text on light surfaces. */
  primaryAction: '#C9490F',
  primaryActionPressed: '#A93C08',
  /** Brand-tinted text on white and on primarySoft (5.18:1 / 4.56:1). */
  primaryPressed: '#C2410C',
  primarySoft: '#FFEDE5',
  primaryBorder: '#FFD3C3',
  white: '#FFFFFF',
  background: '#FAF7F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F4EFE9',
  text: '#2B2622',
  /** 5.96:1 on white, 5.58:1 on the warm background. */
  textMuted: '#6B625B',
  /** 4.78:1 on white: safe for placeholders and inactive tab labels. */
  textSubtle: '#7A716A',
  border: '#EDE4DC',
  borderStrong: '#D9CEC4',
  success: '#2E9E6B',
  successText: '#1B7A4C',
  successSoft: '#E6F6EE',
  warning: '#D99A10',
  warningText: '#8A5A00',
  warningSoft: '#FFF6E0',
  danger: '#D94F4F',
  dangerText: '#B3261E',
  dangerSoft: '#FDECEC',
  protein: '#4C8DFF',
  proteinText: '#2563C9',
  carbs: '#F0A500',
  carbsText: '#8A5A00',
  fat: '#9B6BFF',
  fatText: '#6D3FD1',
  focus: '#1D4ED8',
  overlay: 'rgba(24, 18, 14, 0.45)',
  shadow: '#3A2A20',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
} as const;

export const layout = {
  screenPadding: 20,
  maxWidth: 640,
  mediumMaxWidth: 720,
  wideMaxWidth: 1200,
  sidebarWidth: 264,
  tabBarHeight: 76,
  scanButtonSize: 62,
  /** Minimum touch target (WCAG 2.5.8 is 24px; 48px is comfortable for all ages). */
  minTarget: 48,
  fieldHeight: 56,
} as const;

export const breakpoints = {
  medium: 720,
  wide: 1120,
} as const;

export const textScales = {
  normal: 1,
  large: 1.15,
  xlarge: 1.3,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 21,
  xxl: 27,
  xxxl: 34,
  display: 42,
} as const;

export const shadow = Platform.select({
  ios: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  android: { elevation: 3 },
  default: {},
}) as object;

export const shadowSoft = Platform.select({
  ios: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 1 },
  default: {},
}) as object;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    rounded: 'ui-rounded',
    serif: 'ui-serif',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    rounded: 'sans-serif',
    serif: 'serif',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    rounded: 'var(--font-rounded)',
    serif: 'var(--font-serif)',
    mono: 'var(--font-mono)',
  },
});

/** Backwards-compatible alias used by the Expo starter components. */
export const Colors = {
  light: {
    text: palette.text,
    background: palette.background,
    backgroundElement: palette.surfaceMuted,
    backgroundSelected: palette.primarySoft,
    textSecondary: palette.textMuted,
  },
  dark: {
    text: palette.text,
    background: palette.background,
    backgroundElement: palette.surfaceMuted,
    backgroundSelected: palette.primarySoft,
    textSecondary: palette.textMuted,
  },
} as const;

export const Spacing = spacing;
export const BottomTabInset = 0;
export const MaxContentWidth = layout.maxWidth;
