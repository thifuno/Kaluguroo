import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { layout, palette, radius, shadow, shadowSoft, spacing } from '@/constants/theme';
import { useResponsive } from '@/lib/responsive';
import { useApp } from '@/store/app-provider';
import type { TranslationKey } from '@/lib/i18n';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TAB_CONFIG: Record<
  string,
  { labelKey: TranslationKey; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }
> = {
  index: { labelKey: 'tab.home', icon: 'home-outline', iconActive: 'home' },
  food: { labelKey: 'tab.food', icon: 'restaurant-outline', iconActive: 'restaurant' },
  health: { labelKey: 'tab.health', icon: 'pulse-outline', iconActive: 'pulse' },
  profile: { labelKey: 'tab.profile', icon: 'person-outline', iconActive: 'person' },
};

export function AppTabBar({ state, navigateToTab }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useApp();
  const { isWide } = useResponsive();

  const routes = state.routes.filter((route) => TAB_CONFIG[route.name]);

  const isFocused = (route: (typeof routes)[number]) => {
    const routeIndex = state.routes.findIndex((item) => item.key === route.key);
    return state.index === routeIndex;
  };

  const goTo = (route: (typeof routes)[number]) => {
    if (!isFocused(route)) {
      navigateToTab(route.key);
    }
  };

  const openScan = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    router.push('/scan');
  };

  /* ---------------------------------------------------------------- sidebar */
  if (isWide) {
    return (
      <View
        style={[
          styles.sidebar,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <AppText variant="bodyStrong" color={palette.white} style={styles.brandLetter}>
              K
            </AppText>
          </View>
          <View style={styles.flex}>
            <AppText variant="subheading">Kaluguroo</AppText>
            <AppText variant="caption" color={palette.textMuted}>
              {t('home.subtitle')}
            </AppText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tab.scan')}
          accessibilityHint={t('scan.subtitle')}
          onPress={openScan}
          style={({ pressed }) => [styles.sideScan, pressed && { opacity: 0.9 }]}>
          <LinearGradient
            colors={[palette.primaryAction, '#E8611F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sideScanGradient}>
            <Ionicons name="scan" size={22} color={palette.white} />
            <AppText variant="bodyStrong" color={palette.white}>
              {t('tab.scan')}
            </AppText>
          </LinearGradient>
        </Pressable>

        <View style={styles.sideNav}>
          {routes.map((route) => {
            const config = TAB_CONFIG[route.name];
            const focused = isFocused(route);

            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityLabel={t(config.labelKey)}
                accessibilityState={{ selected: focused }}
                aria-selected={focused}
                onPress={() => goTo(route)}
                style={({ pressed }) => [
                  styles.sideTab,
                  focused && styles.sideTabActive,
                  pressed && { opacity: 0.75 },
                ]}>
                <Ionicons
                  name={focused ? config.iconActive : config.icon}
                  size={24}
                  color={focused ? palette.primaryPressed : palette.textMuted}
                />
                <AppText
                  variant="bodyStrong"
                  color={focused ? palette.primaryPressed : palette.text}
                  style={styles.flex}>
                  {t(config.labelKey)}
                </AppText>
                {focused ? (
                  <Ionicons name="checkmark-circle" size={19} color={palette.primaryPressed} />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sideFooter}>
          <AppText variant="caption" color={palette.textMuted}>
            {t('home.tip')}
          </AppText>
        </View>
      </View>
    );
  }

  /* ------------------------------------------------------------- bottom bar */
  const before = routes.slice(0, 2);
  const after = routes.slice(2);

  const renderTab = (route: (typeof routes)[number]) => {
    const config = TAB_CONFIG[route.name];
    const focused = isFocused(route);

    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityLabel={t(config.labelKey)}
        accessibilityState={{ selected: focused }}
        aria-selected={focused}
        onPress={() => goTo(route)}
        style={({ pressed }) => [
          styles.tab,
          focused && styles.tabActive,
          pressed && { opacity: 0.75 },
        ]}>
        <Ionicons
          name={focused ? config.iconActive : config.icon}
          size={25}
          color={focused ? palette.primaryPressed : palette.textMuted}
        />
        <AppText
          variant="caption"
          color={focused ? palette.primaryPressed : palette.textMuted}
          style={[styles.tabLabel, focused && styles.tabLabelActive]}
          numberOfLines={1}>
          {t(config.labelKey)}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: insets.bottom, height: layout.tabBarHeight + insets.bottom },
      ]}>
      <View style={styles.row}>
        {before.map(renderTab)}

        <View style={styles.scanSlot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('tab.scan')}
            accessibilityHint={t('scan.subtitle')}
            onPress={openScan}
            style={({ pressed }) => [styles.scanButton, pressed && { transform: [{ scale: 0.95 }] }]}>
            <LinearGradient
              colors={[palette.primaryAction, '#E8611F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scanGradient}>
              <Ionicons name="scan" size={28} color={palette.white} />
            </LinearGradient>
          </Pressable>
          <AppText variant="caption" color={palette.textMuted} style={styles.scanLabel}>
            {t('tab.scan')}
          </AppText>
        </View>

        {after.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  /* Sidebar (desktop) */
  sidebar: {
    width: layout.sidebarWidth,
    height: '100%',
    backgroundColor: palette.surface,
    borderRightWidth: 1,
    borderRightColor: palette.border,
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
    ...shadowSoft,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: palette.primaryAction,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: { fontSize: 22 },
  sideScan: { borderRadius: radius.lg, overflow: 'hidden', ...shadow },
  sideScanGradient: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sideNav: { gap: spacing.xs },
  sideTab: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  sideTabActive: { backgroundColor: palette.primarySoft },
  sideFooter: {
    marginTop: 'auto',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    paddingTop: spacing.lg,
  },

  /* Bottom bar (phones/tablets) */
  bar: {
    backgroundColor: palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    ...shadow,
  },
  row: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radius.lg,
    marginHorizontal: 2,
    paddingHorizontal: 2,
  },
  tabActive: { backgroundColor: palette.primarySoft },
  tabLabel: { textAlign: 'center' },
  tabLabelActive: { fontWeight: '700' },
  scanSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: layout.tabBarHeight,
  },
  scanButton: {
    width: layout.scanButtonSize,
    height: layout.scanButtonSize,
    borderRadius: radius.pill,
    marginTop: -26,
    ...shadow,
  },
  scanGradient: {
    flex: 1,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: palette.surface,
  },
  scanLabel: { marginTop: 1, fontWeight: '700' },
});
