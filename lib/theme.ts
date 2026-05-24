import { StyleSheet, Platform } from 'react-native';

export const colors = {
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#eef2ff',
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#22c55e',
    displayBg: '#1e293b',
    displayText: '#ffffff',
    displayMuted: '#94a3b8',
  },
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    surfaceSecondary: '#334155',
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#312e81',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#334155',
    error: '#f87171',
    success: '#4ade80',
    displayBg: '#0f172a',
    displayText: '#ffffff',
    displayMuted: '#64748b',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  display: {
    fontSize: 48,
    fontWeight: '600' as const,
    lineHeight: 56,
  },
};

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
};

export const useThemeColors = (theme: 'light' | 'dark') => colors[theme];

export const createStyles = <T extends StyleSheet.NamedStyles<T>>(
  stylesFn: (colors: typeof colors.light, theme: 'light' | 'dark') => T
) => {
  return (theme: 'light' | 'dark') => StyleSheet.create(stylesFn(colors[theme], theme));
};
