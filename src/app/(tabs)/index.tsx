import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MacroBar } from '@/components/ui/macro-bar';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeader } from '@/components/ui/section-header';
import { palette, radius, spacing } from '@/constants/theme';
import { formatDateKey, greetingKey, todayKey } from '@/lib/date';
import { useResponsive } from '@/lib/responsive';
import { useApp } from '@/store/app-provider';
import type { MealType } from '@/types/models';

const MEALS: {
  key: MealType;
  labelKey: 'home.breakfast' | 'home.lunch' | 'home.dinner' | 'home.snack';
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'breakfast', labelKey: 'home.breakfast', icon: 'sunny-outline' },
  { key: 'lunch', labelKey: 'home.lunch', icon: 'partly-sunny-outline' },
  { key: 'dinner', labelKey: 'home.dinner', icon: 'moon-outline' },
  { key: 'snack', labelKey: 'home.snack', icon: 'cafe-outline' },
];

const TOUR_STEPS = [
  { number: 1, titleKey: 'tour.s1.title', bodyKey: 'tour.s1.body' },
  { number: 2, titleKey: 'tour.s2.title', bodyKey: 'tour.s2.body' },
  { number: 3, titleKey: 'tour.s3.title', bodyKey: 'tour.s3.body' },
] as const;

export default function HomeScreen() {
  const {
    t,
    profile,
    plan,
    todayLogs,
    todayTotals,
    todayBurned,
    activityLogs,
    demoDataLoaded,
    language,
    preferences,
    updatePreferences,
  } = useApp();
  const { isWide } = useResponsive();

  const today = todayKey();
  const target = plan?.calorieTarget ?? 2000;
  const consumed = Math.round(todayTotals.calories);
  const remaining = target - consumed;
  const over = remaining < 0;
  const progress = target > 0 ? consumed / target : 0;

  const mealSummary = useMemo(
    () =>
      MEALS.map((meal) => {
        const logs = todayLogs.filter((log) => log.meal === meal.key);
        return {
          ...meal,
          calories: logs.reduce((total, log) => total + log.calories, 0),
          count: logs.length,
        };
      }),
    [todayLogs],
  );

  const todayActivities = activityLogs.filter((log) => log.date === today);
  const greeting = t(`home.greeting.${greetingKey()}`);
  const name = profile?.displayName ?? '';
  const initial = name.trim().charAt(0).toUpperCase() || 'K';

  const quickActions: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    highlight?: boolean;
  }[] = [
    { label: t('home.scan'), icon: 'scan', onPress: () => router.push('/scan'), highlight: true },
    {
      label: t('home.addFood'),
      icon: 'add-circle-outline',
      onPress: () => router.push('/(tabs)/food'),
    },
    {
      label: t('home.logWeight'),
      icon: 'scale-outline',
      onPress: () => router.push('/(tabs)/health'),
    },
    {
      label: t('home.logActivity'),
      icon: 'walk-outline',
      onPress: () => router.push('/(tabs)/health'),
    },
  ];

  const showTour = !preferences.tourCompleted;

  return (
    <Screen>
      <ScreenHeader
        eyebrow={formatDateKey(today, language)}
        title={`${greeting}, ${name || t('profile.guest')}`}
        subtitle={t('home.subtitle')}
        helpTopic="home"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('tab.profile')}
            onPress={() => router.push('/(tabs)/profile')}
            style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.8 }]}>
            <AppText variant="bodyStrong" color={palette.white} style={styles.avatarText}>
              {initial}
            </AppText>
          </Pressable>
        }
      />

      {demoDataLoaded ? (
        <View style={styles.demoBanner}>
          <Ionicons name="flask-outline" size={18} color={palette.warningText} />
          <AppText variant="caption" color={palette.warningText} style={styles.demoText}>
            {t('home.demoNotice')}
          </AppText>
        </View>
      ) : null}

      {showTour ? (
        <Card tone="primary" style={styles.tourCard}>
          <View style={styles.tourHeader}>
            <Ionicons name="sparkles" size={22} color={palette.primaryPressed} />
            <AppText variant="subheading" color={palette.primaryPressed} style={styles.flex}>
              {t('tour.title')}
            </AppText>
          </View>

          {TOUR_STEPS.map((step) => (
            <View key={step.number} style={styles.tourStep}>
              <View style={styles.tourNumber}>
                <AppText variant="bodyStrong" color={palette.white}>
                  {step.number}
                </AppText>
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyStrong" color={palette.primaryPressed}>
                  {t(step.titleKey)}
                </AppText>
                <AppText variant="body" color={palette.primaryPressed}>
                  {t(step.bodyKey)}
                </AppText>
              </View>
            </View>
          ))}

          <View style={styles.tourActions}>
            <Button label={t('tour.start')} onPress={() => router.push('/scan')} icon="scan" />
            <Button
              label={t('tour.dismiss')}
              onPress={() => updatePreferences({ tourCompleted: true })}
              variant="secondary"
              icon="checkmark"
            />
          </View>
        </Card>
      ) : null}

      <View style={[styles.layout, isWide && styles.layoutWide]}>
        <View style={[styles.column, isWide && styles.columnWide]}>
          <Card style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroText}>
                <View style={styles.heroLabelRow}>
                  <AppText variant="label" color={palette.textMuted}>
                    {over ? t('home.over') : t('home.remaining')}
                  </AppText>
                  <Badge
                    tone={over ? 'danger' : 'success'}
                    label={`${Math.round(Math.abs(remaining))} ${t('common.kcal')}`}
                  />
                </View>
                <AppText variant="display" color={over ? palette.dangerText : palette.text}>
                  {Math.abs(remaining)}
                </AppText>
                <AppText variant="caption">
                  {over ? t('home.over') : t('home.leftToEatHint')}
                </AppText>
              </View>

              <ProgressRing
                progress={Math.abs(progress) > 1 ? 1 : progress}
                size={128}
                strokeWidth={12}
                color={over ? palette.dangerText : palette.primaryAction}
                label={`${Math.round(progress * 100)}%`}
                caption={t('common.today')}
              />
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <AppText variant="caption">{t('home.target')}</AppText>
                <AppText variant="bodyStrong">{target}</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.heroStat}>
                <AppText variant="caption">{t('home.consumed')}</AppText>
                <AppText variant="bodyStrong">{consumed}</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.heroStat}>
                <AppText variant="caption">{t('home.burned')}</AppText>
                <AppText variant="bodyStrong" color={palette.successText}>
                  {todayBurned}
                </AppText>
              </View>
            </View>
          </Card>

          <Card style={styles.macroCard}>
            <MacroBar
              label={t('home.protein')}
              value={todayTotals.protein}
              target={plan?.proteinG ?? 0}
              color={palette.protein}
            />
            <MacroBar
              label={t('home.carbs')}
              value={todayTotals.carbs}
              target={plan?.carbsG ?? 0}
              color={palette.carbs}
            />
            <MacroBar
              label={t('home.fat')}
              value={todayTotals.fat}
              target={plan?.fatG ?? 0}
              color={palette.fat}
            />
          </Card>
        </View>

        <View style={[styles.column, isWide && styles.columnWide]}>
          <SectionHeader title={t('home.quickActions')} />
          <View style={styles.quickGrid}>
            {quickActions.map((action) => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.quickCard,
                  action.highlight && styles.quickCardPrimary,
                  pressed && { opacity: 0.8 },
                ]}>
                <View
                  style={[styles.quickIcon, action.highlight && styles.quickIconOnPrimary]}>
                  <Ionicons
                    name={action.icon}
                    size={25}
                    color={action.highlight ? palette.white : palette.primaryPressed}
                  />
                </View>
                <AppText
                  variant="bodyStrong"
                  color={action.highlight ? palette.white : palette.text}
                  style={styles.quickLabel}>
                  {action.label}
                </AppText>
              </Pressable>
            ))}
          </View>

          <SectionHeader
            title={t('home.meals')}
            actionLabel={t('common.viewAll')}
            onAction={() => router.push('/diary')}
          />
          <AppText variant="caption" style={styles.sectionHint}>
            {t('home.openDiary')}
          </AppText>

          <Card padded={false} style={styles.mealsCard}>
            {mealSummary.map((meal, index) => (
              <Pressable
                key={meal.key}
                accessibilityRole="button"
                accessibilityLabel={`${t(meal.labelKey)}, ${Math.round(meal.calories)} ${t('common.kcal')}`}
                onPress={() => router.push('/diary')}
                style={({ pressed }) => [
                  styles.mealRow,
                  index < mealSummary.length - 1 && styles.mealDivider,
                  pressed && { opacity: 0.7 },
                ]}>
                <View style={styles.mealIcon}>
                  <Ionicons name={meal.icon} size={21} color={palette.primaryPressed} />
                </View>
                <View style={styles.mealText}>
                  <AppText variant="bodyStrong">{t(meal.labelKey)}</AppText>
                  <AppText variant="caption">
                    {meal.count > 0
                      ? t('diary.count', { count: meal.count })
                      : t('home.notLogged')}
                  </AppText>
                </View>
                <View style={styles.mealRight}>
                  <AppText variant="bodyStrong" color={palette.primaryPressed}>
                    {Math.round(meal.calories)}
                  </AppText>
                  <AppText variant="caption">{t('common.kcal')}</AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
              </Pressable>
            ))}
          </Card>

          {consumed === 0 ? (
            <Card tone="primary" style={styles.emptyCard}>
              <AppText variant="subheading" color={palette.primaryPressed}>
                {t('home.emptyTitle')}
              </AppText>
              <AppText variant="body" color={palette.primaryPressed}>
                {t('home.emptyBody')}
              </AppText>
              <View style={styles.emptyActions}>
                <Button label={t('home.scan')} onPress={() => router.push('/scan')} icon="scan" />
                <Button
                  label={t('home.addFood')}
                  onPress={() => router.push('/(tabs)/food')}
                  variant="secondary"
                  icon="add"
                />
              </View>
            </Card>
          ) : null}

          <SectionHeader
            title={t('home.activitySummary')}
            actionLabel={t('home.logActivity')}
            onAction={() => router.push('/(tabs)/health')}
          />

          <Card style={styles.activityCard}>
            {todayActivities.length === 0 ? (
              <>
                <AppText variant="body" color={palette.textMuted}>
                  {t('home.noActivity')}
                </AppText>
                <Button
                  label={t('home.logActivity')}
                  onPress={() => router.push('/(tabs)/health')}
                  variant="soft"
                  icon="walk-outline"
                />
              </>
            ) : (
              todayActivities.map((activity) => (
                <View key={activity.id} style={styles.activityRow}>
                  <View style={styles.mealIcon}>
                    <Ionicons name="walk-outline" size={21} color={palette.successText} />
                  </View>
                  <View style={styles.mealText}>
                    <AppText variant="bodyStrong">{activity.name}</AppText>
                    <AppText variant="caption">
                      {activity.minutes} {t('common.minutes')}
                    </AppText>
                  </View>
                  <AppText variant="bodyStrong" color={palette.successText}>
                    -{activity.caloriesBurned}
                  </AppText>
                </View>
              ))
            )}
          </Card>

          <Card tone="muted" style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={22} color={palette.warningText} />
            <AppText variant="body" style={styles.flex}>
              {t('home.tip')}
            </AppText>
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: palette.primaryAction,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20 },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.warningSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  demoText: { flex: 1 },
  tourCard: { gap: spacing.md, marginBottom: spacing.md, borderWidth: 0 },
  tourHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tourStep: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  tourNumber: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: palette.primaryAction,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourActions: { gap: spacing.sm, marginTop: spacing.xs },
  layout: { gap: spacing.md },
  layoutWide: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xl },
  column: { gap: 0 },
  columnWide: { flex: 1, minWidth: 0 },
  heroCard: { gap: spacing.lg },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroText: { flex: 1, gap: 2 },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: 2,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  heroStat: { flex: 1, alignItems: 'center', gap: 1 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28, backgroundColor: palette.borderStrong },
  macroCard: { marginTop: spacing.md, gap: spacing.lg },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  quickCardPrimary: { backgroundColor: palette.primaryAction, borderColor: palette.primaryAction },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconOnPrimary: { backgroundColor: 'rgba(255,255,255,0.18)' },
  quickLabel: { flex: 1 },
  sectionHint: { marginTop: -spacing.sm, marginBottom: spacing.sm },
  mealsCard: { overflow: 'hidden' },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 66,
  },
  mealDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  mealIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealText: { flex: 1, gap: 1 },
  mealRight: { alignItems: 'flex-end', gap: 0 },
  emptyCard: { marginTop: spacing.md, gap: spacing.sm, borderWidth: 0 },
  emptyActions: { gap: spacing.sm, marginTop: spacing.xs },
  activityCard: { gap: spacing.md },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
