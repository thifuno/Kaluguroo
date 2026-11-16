import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MacroBar } from '@/components/ui/macro-bar';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EmptyState } from '@/components/ui/states';
import { palette, radius, spacing } from '@/constants/theme';
import { EditLogSheet } from '@/features/food/edit-log-sheet';
import { useResponsive } from '@/lib/responsive';
import { useApp } from '@/store/app-provider';
import type { FoodLog, MealType } from '@/types/models';

const MEALS: {
  value: MealType;
  labelKey: 'home.breakfast' | 'home.lunch' | 'home.dinner' | 'home.snack';
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: 'breakfast', labelKey: 'home.breakfast', icon: 'sunny-outline' },
  { value: 'lunch', labelKey: 'home.lunch', icon: 'restaurant-outline' },
  { value: 'dinner', labelKey: 'home.dinner', icon: 'moon-outline' },
  { value: 'snack', labelKey: 'home.snack', icon: 'cafe-outline' },
];

export default function DiaryScreen() {
  const { t, todayLogs, todayTotals, plan } = useApp();
  const { isWide } = useResponsive();
  const [selected, setSelected] = useState<FoodLog | null>(null);
  const [visible, setVisible] = useState(false);
  // Remount the sheet per entry so its form state starts from that log.
  const [nonce, setNonce] = useState(0);

  const target = plan?.calorieTarget ?? 2000;
  const consumed = Math.round(todayTotals.calories);
  const remaining = target - consumed;
  const over = remaining < 0;

  const openLog = (log: FoodLog) => {
    setSelected(log);
    setNonce((value) => value + 1);
    setVisible(true);
  };

  const groups = MEALS.map((meal) => {
    const logs = todayLogs.filter((log) => log.meal === meal.value);
    return {
      ...meal,
      logs,
      calories: Math.round(logs.reduce((total, log) => total + log.calories, 0)),
    };
  });

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const goToFood = () => router.replace('/(tabs)/food');

  return (
    <Screen bottomInset={spacing.xl}>
      <ScreenHeader
        title={t('diary.title')}
        subtitle={t('diary.subtitle')}
        helpTopic="diary"
        onClose={close}
      />

      <View style={styles.actions}>
        <Button
          label={t('diary.addFood')}
          onPress={goToFood}
          icon="add"
          style={styles.actionButton}
        />
        <Button
          label={t('diary.scan')}
          onPress={() => router.push('/scan')}
          icon="scan-outline"
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      <Card tone="surface" style={styles.summary}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryBlock}>
            <AppText variant="caption">{t('home.consumed')}</AppText>
            <View style={styles.summaryValue}>
              <AppText variant="title" color={palette.primaryPressed}>
                {consumed}
              </AppText>
              <AppText variant="caption">
                / {target} {t('common.kcal')}
              </AppText>
            </View>
          </View>
          <View style={styles.remaining}>
            <AppText variant="caption">{over ? t('home.over') : t('home.remaining')}</AppText>
            <AppText
              variant="subheading"
              color={over ? palette.dangerText : palette.successText}>
              {Math.abs(remaining)} {t('common.kcal')}
            </AppText>
          </View>
        </View>

        <View style={styles.macros}>
          <MacroBar
            label={t('home.protein')}
            value={todayTotals.protein}
            target={plan?.proteinG ?? 100}
            color={palette.protein}
          />
          <MacroBar
            label={t('home.carbs')}
            value={todayTotals.carbs}
            target={plan?.carbsG ?? 200}
            color={palette.carbs}
          />
          <MacroBar
            label={t('home.fat')}
            value={todayTotals.fat}
            target={plan?.fatG ?? 60}
            color={palette.fat}
          />
        </View>
      </Card>

      {todayLogs.length === 0 ? (
        <EmptyState
          icon="restaurant-outline"
          title={t('diary.emptyTitle')}
          body={t('diary.emptyBody')}
          actionLabel={t('diary.addFood')}
          onAction={goToFood}
        />
      ) : (
        <View style={[styles.sections, isWide && styles.sectionsWide]}>
          {groups.map((meal) => (
            <View key={meal.value} style={[styles.section, isWide && styles.sectionWide]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitle}>
                <View style={styles.sectionIcon}>
                  <Ionicons name={meal.icon} size={19} color={palette.primaryPressed} />
                </View>
                <AppText variant="subheading">{t(meal.labelKey)}</AppText>
              </View>
              <AppText variant="caption">
                {meal.calories} {t('common.kcal')}
              </AppText>
            </View>

            {meal.logs.length === 0 ? (
              <Card tone="muted" style={styles.emptyMeal}>
                <AppText variant="caption">{t('home.emptyTitle')}</AppText>
                <Button
                  label={t('diary.addFood')}
                  onPress={goToFood}
                  variant="soft"
                  size="sm"
                  icon="add"
                  fullWidth={false}
                />
              </Card>
            ) : (
              <Card padded={false} style={styles.logCard}>
                {meal.logs.map((log, index) => (
                  <Pressable
                    key={log.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${log.name}, ${Math.round(log.calories)} ${t('common.kcal')}, ${t('common.edit')}`}
                    onPress={() => openLog(log)}
                    style={({ pressed }) => [
                      styles.logRow,
                      index < meal.logs.length - 1 && styles.logDivider,
                      pressed && { opacity: 0.7 },
                    ]}>
                    <View style={styles.logIcon}>
                      <Ionicons name="restaurant-outline" size={19} color={palette.primaryPressed} />
                    </View>
                    <View style={styles.logText}>
                      <AppText variant="bodyStrong" numberOfLines={2}>
                        {log.name}
                      </AppText>
                      <AppText variant="caption" numberOfLines={2}>
                        ×{log.servings.toFixed(1)} · {log.protein}g {t('food.protein')} · {log.carbs}g{' '}
                        {t('food.carbs')} · {log.fat}g {t('food.fat')}
                      </AppText>
                    </View>
                    <View style={styles.logRight}>
                      <View style={styles.logCalories}>
                        <AppText variant="bodyStrong" color={palette.primaryPressed}>
                          {Math.round(log.calories)}
                        </AppText>
                        <AppText variant="caption">{t('common.kcal')}</AppText>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
                    </View>
                  </Pressable>
                ))}
              </Card>
            )}
            </View>
          ))}
        </View>
      )}

      {todayLogs.length > 0 ? (
        <Button
          label={t('diary.addFood')}
          onPress={goToFood}
          variant="soft"
          icon="add-circle-outline"
          style={styles.bottomAdd}
        />
      ) : null}

      <EditLogSheet
        key={`${selected?.id ?? 'none'}-${nonce}`}
        log={selected}
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  actionButton: { flex: 1 },
  summary: { gap: spacing.lg },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryBlock: { flexShrink: 1 },
  summaryValue: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  remaining: { alignItems: 'flex-end', gap: 2 },
  macros: { gap: spacing.sm },
  sections: {},
  sectionsWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  section: { gap: spacing.sm, marginTop: spacing.lg },
  sectionWide: { flexBasis: '46%', flexGrow: 1, minWidth: 0, marginTop: 0 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    borderWidth: 0,
  },
  logCard: { overflow: 'hidden' },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 64,
  },
  logDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logText: { flex: 1, gap: 2 },
  logRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  logCalories: { alignItems: 'flex-end' },
  bottomAdd: { marginTop: spacing.lg },
});
