import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function AppLayout() {
  const { isAuthenticated, theme } = useAppStore();
  const themeColors = colors[theme];

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
        animation: 'fade',
      }}
    />
  );
}
