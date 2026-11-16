import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { ToastProvider } from '@/components/ui/toast';
import { palette } from '@/constants/theme';
import { AppProvider, useApp } from '@/store/app-provider';
import { TextScaleProvider } from '@/store/text-scale-provider';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 350, fade: true });

export default function RootLayout() {
  return (
    <AppProvider>
      <TextScaleProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </TextScaleProvider>
    </AppProvider>
  );
}

function AppShell() {
  const { hydrated, session, onboarded } = useApp();

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hide();
    }
  }, [hydrated]);

  return (
    <>
      <StatusBar style="dark" />
      {/*
        The two wrappers below are web layout hooks: global.css turns them into a
        centered, phone-sized frame on wide browser windows (see #app-root / #app-frame).
      */}
      <View style={styles.root} testID="app-root">
        <View style={styles.frame} testID="app-frame">
          {hydrated ? (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: palette.background },
                animation: 'fade',
              }}>
              <Stack.Screen name="index" />

              <Stack.Protected guard={!session}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>

              <Stack.Protected guard={Boolean(session) && !onboarded}>
                <Stack.Screen name="onboarding" />
              </Stack.Protected>

              <Stack.Protected guard={Boolean(session) && onboarded}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="scan"
                  options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="diary"
                  options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="edit-profile"
                  options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
              </Stack.Protected>
            </Stack>
          ) : (
            <View style={styles.loading} />
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  frame: { flex: 1, width: '100%' },
  loading: { flex: 1, backgroundColor: palette.background },
});
