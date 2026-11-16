import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalorieBars } from '@/components/calorie-bars';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState } from '@/components/ui/states';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { WeightChart } from '@/components/weight-chart';
import { palette, radius, spacing } from '@/constants/theme';
import { formatShortDate, lastNDays, relativeDayLabel } from '@/lib/date';
import { EXERCISE_PRESETS, caloriesBurnedPerMinute, clamp } from '@/lib/nutrition';
import { useResponsive } from '@/lib/responsive';
import { useApp } from '@/store/app-provider';

export default function HealthScreen() {
  const {
    t,
    language,
    profile,
    plan,
    weightLogs,
    activityLogs,
    logsForDate,
    addWeight,
    addActivity,
  } = useApp();
  const toast = useToast();
  const { isWide } = useResponsive();

  const [weightVisible, setWeightVisible] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightError, setWeightError] = useState<string | null>(null);

  const [activityVisible, setActivityVisible] = useState(false);
  const [presetId, setPresetId] = useState<string>(EXERCISE_PRESETS[0].id);
  const [activityName, setActivityName] = useState<string>(EXERCISE_PRESETS[0].name);
  const [minutes, setMinutes] = useState('30');
  const [burnedInput, setBurnedInput] = useState('');
  const [burnedTouched, setBurnedTouched] = useState(false);

  const sortedWeights = useMemo(
    () => [...weightLogs].sort((a, b) => a.date.localeCompare(b.date)),
    [weightLogs],
  );
  const latest = sortedWeights[sortedWeights.length - 1];
  const startWeight = sortedWeights[0]?.weightKg ?? profile?.weightKg ?? 0;
  const currentWeight = latest?.weightKg ?? profile?.weightKg ?? 0;
  const targetWeight = profile?.targetWeightKg ?? 0;

  const goalTotal = startWeight - targetWeight;
  const goalProgress = goalTotal === 0 ? 1 : clamp((startWeight - currentWeight) / goalTotal, 0, 1);
  const toGoal = Math.abs(currentWeight - targetWeight);

  const calorieData = useMemo(
    () =>
      lastNDays(7).map((date) => ({
        date,
        label: formatShortDate(date, language).split(' ')[0],
        calories: logsForDate(date).reduce((total, log) => total + log.calories, 0),
      })),
    [logsForDate, language],
  );

  const activityPreset = EXERCISE_PRESETS.find((preset) => preset.id === presetId);
  const suggestedBurned = activityPreset
    ? Math.round(caloriesBurnedPerMinute(activityPreset.met, currentWeight) * (Number(minutes) || 0))
    : 0;
  const burnedValue = burnedTouched ? burnedInput : String(suggestedBurned);

  const openWeight = () => {
    setWeightInput('');
    setWeightError(null);
    setWeightVisible(true);
  };

  const saveWeight = () => {
    const value = Number(weightInput.replace(',', '.'));
    if (!Number.isFinite(value) || value < 30 || value > 300) {
      setWeightError(t('health.invalidWeight'));
      return;
    }
    addWeight(value);
    toast(t('health.weightAdded'), 'success');
    setWeightVisible(false);
    setWeightInput('');
    setWeightError(null);
  };

  const saveActivity = () => {
    const duration = Number(minutes.replace(',', '.'));
    const burned = Number(burnedValue.replace(',', '.'));
    if (!activityName.trim() || !Number.isFinite(duration) || duration <= 0) return;
    addActivity({
      name: activityName.trim(),
      minutes: Math.round(duration),
      caloriesBurned: Number.isFinite(burned) && burned > 0 ? Math.round(burned) : 0,
    });
    toast(t('health.activityAdded'), 'success');
    setActivityVisible(false);
  };

  const recentActivities = [...activityLogs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const metrics = (
    <>
      <View style={styles.statRow}>
        <Card style={styles.statCard}>
          <AppText variant="caption">{t('health.weight')}</AppText>
          <AppText variant="heading">{currentWeight ? currentWeight.toFixed(1) : '-'}</AppText>
          <AppText variant="caption">{t('common.kg')}</AppText>
        </Card>
        <Card style={styles.statCard}>
          <AppText variant="caption">{t('health.bmi')}</AppText>
          <AppText variant="heading">{plan ? plan.bmi.toFixed(1) : '-'}</AppText>
          <Badge
            tone={plan?.bmiCategory === 'normal' ? 'success' : 'warning'}
            label={plan ? t(`onboarding.bmi.${plan.bmiCategory}`) : '-'}
          />
        </Card>
        <Card style={styles.statCard}>
          <AppText variant="caption">{t('health.calorieTarget')}</AppText>
          <AppText variant="heading">{plan?.calorieTarget ?? '-'}</AppText>
          <AppText variant="caption">{t('common.kcal')}</AppText>
        </Card>
      </View>

      <Card style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalText}>
            <AppText variant="subheading">{t('health.goalProgress')}</AppText>
            <AppText variant="body" color={palette.textMuted}>
              {t('health.toGoal', { value: toGoal.toFixed(1) })}
            </AppText>
          </View>
          <AppText variant="heading" color={palette.primaryPressed}>
            {Math.round(goalProgress * 100)}%
          </AppText>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${goalProgress * 100}%` }]} />
        </View>
        <View style={styles.goalFooter}>
          <AppText variant="caption">
            {t('health.startWeight')} {startWeight.toFixed(1)} {t('common.kg')}
          </AppText>
          <AppText variant="caption">
            {t('health.target')} {targetWeight.toFixed(1)} {t('common.kg')}
          </AppText>
        </View>
        <View style={styles.helpRow}>
          <Ionicons name="information-circle-outline" size={19} color={palette.textMuted} />
          <AppText variant="caption" style={styles.helpText}>
            {t('health.goalHelp')}
          </AppText>
        </View>
      </Card>

      <SectionHeader title={t('health.weightHistory')} />
      <Card style={styles.chartCard}>
        {sortedWeights.length < 2 ? (
          <EmptyState
            compact
            icon="analytics-outline"
            title={t('health.noChartData')}
            body={t('health.noWeightsBody')}
            actionLabel={t('health.addWeight')}
            onAction={openWeight}
          />
        ) : (
          <>
            <WeightChart data={sortedWeights.slice(-14)} />
            <View style={styles.historyList}>
              {sortedWeights
                .slice(-4)
                .reverse()
                .map((log) => (
                  <View key={log.id} style={styles.historyRow}>
                    <AppText variant="body">{relativeDayLabel(log.date, language)}</AppText>
                    <AppText variant="bodyStrong">{log.weightKg.toFixed(1)} kg</AppText>
                  </View>
                ))}
            </View>
          </>
        )}
      </Card>
    </>
  );

  const intakeAndActivity = (
    <>
      <SectionHeader title={t('health.calorieIntake')} />
      <Card style={styles.calorieCard}>
        <CalorieBars data={calorieData} target={plan?.calorieTarget ?? 2000} />
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: palette.primaryAction }]} />
            <AppText variant="caption">
              {t('health.calorieIntake')} · {t('health.sevenDay')}
            </AppText>
          </View>
          <AppText variant="caption">
            {t('home.target')} {plan?.calorieTarget ?? 2000} {t('common.kcal')}
          </AppText>
        </View>
      </Card>

      <SectionHeader
        title={t('health.activity')}
        actionLabel={t('health.addActivity')}
        onAction={() => setActivityVisible(true)}
      />
      <Card style={styles.activityCard}>
        {recentActivities.length === 0 ? (
          <EmptyState
            compact
            icon="walk-outline"
            title={t('health.noActivity')}
            actionLabel={t('health.addActivity')}
            onAction={() => setActivityVisible(true)}
          />
        ) : (
          recentActivities.map((log, index) => (
            <View
              key={log.id}
              style={[styles.activityRow, index > 0 && styles.activityDivider]}>
              <View style={styles.activityIcon}>
                <Ionicons name="walk-outline" size={20} color={palette.successText} />
              </View>
              <View style={styles.activityText}>
                <AppText variant="bodyStrong">{log.name}</AppText>
                <AppText variant="caption">
                  {relativeDayLabel(log.date, language)} · {log.minutes} {t('common.minutes')}
                </AppText>
              </View>
              <AppText variant="bodyStrong" color={palette.successText}>
                -{log.caloriesBurned}
              </AppText>
            </View>
          ))
        )}
      </Card>
    </>
  );

  return (
    <Screen>
      <ScreenHeader
        title={t('health.title')}
        subtitle={t('health.subtitle')}
        helpTopic="health"
      />

      <View style={styles.primaryActions}>
        <Button
          label={t('health.addWeight')}
          onPress={openWeight}
          icon="scale-outline"
          style={styles.actionButton}
          accessibilityHint={t('health.weightHistory')}
        />
        <Button
          label={t('health.addActivity')}
          onPress={() => setActivityVisible(true)}
          icon="walk-outline"
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      <Card tone="muted" style={styles.motivationCard}>
        <Ionicons name="trending-up-outline" size={22} color={palette.primaryPressed} />
        <AppText variant="body" style={styles.helpText}>
          {t('health.greeting')}
        </AppText>
      </Card>

      <View style={[styles.layout, isWide && styles.layoutWide]}>
        <View style={[styles.column, isWide && styles.columnWide]}>{metrics}</View>
        <View style={[styles.column, isWide && styles.columnWide]}>{intakeAndActivity}</View>
      </View>

      <ModalSheet
        visible={weightVisible}
        onClose={() => setWeightVisible(false)}
        closeLabel={t('common.close')}
        title={t('health.addWeight')}
        subtitle={t('health.weightPlaceholder')}
        footer={<Button label={t('health.saveWeight')} onPress={saveWeight} icon="checkmark" />}>
        <TextField
          label={t('health.weight')}
          value={weightInput}
          onChangeText={(value) => {
            setWeightInput(value);
            setWeightError(null);
          }}
          placeholder={t('health.weightPlaceholder')}
          keyboardType="decimal-pad"
          suffix={t('common.kg')}
          error={weightError}
          icon="scale-outline"
          autoFocus
        />
        <AppText variant="caption">
          {t('health.startWeight')} {startWeight.toFixed(1)} {t('common.kg')} ·{' '}
          {t('health.target')} {targetWeight.toFixed(1)} {t('common.kg')}
        </AppText>
      </ModalSheet>

      <ModalSheet
        visible={activityVisible}
        onClose={() => setActivityVisible(false)}
        closeLabel={t('common.close')}
        title={t('health.addActivity')}
        subtitle={t('health.duration')}
        footer={<Button label={t('common.save')} onPress={saveActivity} icon="checkmark" />}>
        <AppText variant="label" color={palette.textMuted}>
          {t('health.activityName')}
        </AppText>
        <View style={styles.presetRow}>
          {EXERCISE_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={language === 'th' ? preset.name : preset.nameEn}
              selected={presetId === preset.id}
              onPress={() => {
                setPresetId(preset.id);
                setActivityName(language === 'th' ? preset.name : preset.nameEn);
                setBurnedTouched(false);
              }}
            />
          ))}
        </View>

        <TextField
          label={t('health.activityName')}
          value={activityName}
          onChangeText={setActivityName}
          placeholder={language === 'th' ? 'เดินเร็ว' : 'Walking'}
        />
        <TextField
          label={t('health.duration')}
          value={minutes}
          onChangeText={(value) => {
            setMinutes(value);
            setBurnedTouched(false);
          }}
          keyboardType="number-pad"
          suffix={t('common.minutes')}
        />
        <TextField
          label={t('health.burned')}
          value={burnedValue}
          onChangeText={(value) => {
            setBurnedInput(value);
            setBurnedTouched(true);
          }}
          keyboardType="number-pad"
          suffix={t('common.kcal')}
          hint={`${t('common.estimate')}: ${suggestedBurned} ${t('common.kcal')}`}
        />
      </ModalSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  primaryActions: { flexDirection: 'row', gap: spacing.sm },
  actionButton: { flex: 1 },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    borderWidth: 0,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  helpText: { flex: 1 },
  layout: { gap: spacing.md },
  layoutWide: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xl },
  column: { gap: 0 },
  columnWide: { flex: 1, minWidth: 0 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xxl },
  statCard: { flex: 1, minWidth: 100, gap: 2, alignItems: 'flex-start' },
  goalCard: { marginTop: spacing.md, gap: spacing.sm },
  goalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  goalText: { flex: 1, gap: 1 },
  progressTrack: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceMuted,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.primaryAction },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  chartCard: { gap: spacing.md },
  historyList: { gap: spacing.sm },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  calorieCard: { gap: spacing.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  activityCard: { gap: 0 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  activityDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: palette.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: { flex: 1, gap: 1 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
