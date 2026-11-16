import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeader } from '@/components/ui/section-header';
import { Segmented } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { palette, spacing } from '@/constants/theme';
import { calcPlan } from '@/lib/nutrition';
import { useResponsive } from '@/lib/responsive';
import { useApp } from '@/store/app-provider';
import type { ActivityLevel, Gender, HealthGoal, HealthProfile } from '@/types/models';

const ACTIVITIES: {
  value: ActivityLevel;
  labelKey:
    | 'onboarding.activity.sedentary'
    | 'onboarding.activity.light'
    | 'onboarding.activity.moderate'
    | 'onboarding.activity.active'
    | 'onboarding.activity.very_active';
}[] = [
  { value: 'sedentary', labelKey: 'onboarding.activity.sedentary' },
  { value: 'light', labelKey: 'onboarding.activity.light' },
  { value: 'moderate', labelKey: 'onboarding.activity.moderate' },
  { value: 'active', labelKey: 'onboarding.activity.active' },
  { value: 'very_active', labelKey: 'onboarding.activity.very_active' },
];

const GOALS: {
  value: HealthGoal;
  labelKey: 'onboarding.goal.lose' | 'onboarding.goal.maintain' | 'onboarding.goal.gain';
}[] = [
  { value: 'lose', labelKey: 'onboarding.goal.lose' },
  { value: 'maintain', labelKey: 'onboarding.goal.maintain' },
  { value: 'gain', labelKey: 'onboarding.goal.gain' },
];

export default function EditProfileScreen() {
  const { t, profile, updateProfile } = useApp();
  const toast = useToast();
  const { isWide } = useResponsive();

  const [name, setName] = useState(profile?.displayName ?? '');
  const [age, setAge] = useState(String(profile?.age ?? 30));
  const [gender, setGender] = useState<Gender>(profile?.gender ?? 'female');
  const [height, setHeight] = useState(String(profile?.heightCm ?? 170));
  const [weight, setWeight] = useState(String(profile?.weightKg ?? 60));
  const [target, setTarget] = useState(String(profile?.targetWeightKg ?? 58));
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activityLevel ?? 'moderate');
  const [goal, setGoal] = useState<HealthGoal>(profile?.goal ?? 'lose');
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const number = (value: string) => Number(value.replace(',', '.'));

  const draft: HealthProfile = useMemo(
    () => ({
      displayName: name.trim() || profile?.displayName || 'Kaluguroo',
      age: Number(age.replace(',', '.')) || 30,
      gender,
      heightCm: Number(height.replace(',', '.')) || 170,
      weightKg: Number(weight.replace(',', '.')) || 60,
      targetWeightKg: Number(target.replace(',', '.')) || 58,
      activityLevel: activity,
      goal,
    }),
    [name, profile?.displayName, age, gender, height, weight, target, activity, goal],
  );

  const plan = useMemo(() => calcPlan(draft), [draft]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  };

  const save = () => {
    const next: Record<string, string | null> = {};
    if (!(number(age) >= 13 && number(age) <= 100)) next.age = t('onboarding.ageError');
    if (!(number(height) >= 100 && number(height) <= 250)) next.height = t('onboarding.heightError');
    if (!(number(weight) >= 30 && number(weight) <= 300)) next.weight = t('onboarding.weightError');
    if (!(number(target) >= 30 && number(target) <= 300)) next.target = t('onboarding.targetWeightError');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    void updateProfile(draft).then(() => {
      toast(t('edit.saved'), 'success');
      close();
    });
  };

  return (
    <Screen
      bottomInset={spacing.lg}
      maxWidth={640}
      footer={
        <View style={styles.footer}>
          <Button label={t('edit.saveChanges')} onPress={save} icon="checkmark" />
        </View>
      }>
      <ScreenHeader
        title={t('edit.title')}
        subtitle={t('edit.subtitle')}
        onClose={close}
      />

      <View style={[styles.layout, isWide && styles.layoutWide]}>
        <View style={[styles.column, isWide && styles.columnWide]}>
          <SectionHeader title={t('edit.measurement')} />
          <Card style={styles.card}>
            <TextField
              label={t('auth.displayName')}
              value={name}
              onChangeText={setName}
              icon="person-outline"
            />

            <View style={styles.row}>
              <TextField
                label={t('onboarding.age')}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                suffix={t('common.years')}
                error={errors.age}
                containerStyle={styles.flex}
              />
              <TextField
                label={t('onboarding.height')}
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                suffix={t('common.cm')}
                error={errors.height}
                containerStyle={styles.flex}
              />
            </View>

            <View style={styles.block}>
              <AppText variant="label" color={palette.textMuted}>
                {t('onboarding.gender')}
              </AppText>
              <Segmented
                value={gender}
                onChange={setGender}
                options={[
                  { value: 'female', label: t('onboarding.gender.female') },
                  { value: 'male', label: t('onboarding.gender.male') },
                  { value: 'other', label: t('onboarding.gender.other') },
                ]}
              />
            </View>

            <View style={styles.row}>
              <TextField
                label={t('onboarding.weight')}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                suffix={t('common.kg')}
                error={errors.weight}
                containerStyle={styles.flex}
              />
              <TextField
                label={t('onboarding.targetWeight')}
                value={target}
                onChangeText={setTarget}
                keyboardType="decimal-pad"
                suffix={t('common.kg')}
                error={errors.target}
                containerStyle={styles.flex}
              />
            </View>

            <AppText variant="caption">{t('onboarding.bodyHelp')}</AppText>
          </Card>
        </View>

        <View style={[styles.column, isWide && styles.columnWide]}>
          <SectionHeader title={t('edit.goals')} />
          <Card style={styles.card}>
            <View style={styles.block}>
              <AppText variant="label" color={palette.textMuted}>
                {t('onboarding.activity')}
              </AppText>
              <View style={styles.chips}>
                {ACTIVITIES.map((option) => (
                  <Chip
                    key={option.value}
                    label={t(option.labelKey)}
                    selected={activity === option.value}
                    onPress={() => setActivity(option.value)}
                  />
                ))}
              </View>
              <AppText variant="caption">{t('onboarding.activityHelp')}</AppText>
            </View>

            <View style={styles.block}>
              <AppText variant="label" color={palette.textMuted}>
                {t('onboarding.goal')}
              </AppText>
              <View style={styles.chips}>
                {GOALS.map((option) => (
                  <Chip
                    key={option.value}
                    label={t(option.labelKey)}
                    selected={goal === option.value}
                    onPress={() => setGoal(option.value)}
                  />
                ))}
              </View>
              <AppText variant="caption">{t('onboarding.goalHelp')}</AppText>
            </View>
          </Card>

          <Card tone="primary" style={styles.planCard}>
            <AppText variant="label" color={palette.primaryPressed}>
              {t('plan.title')}
            </AppText>
            <View style={styles.planRow}>
              <AppText variant="display" color={palette.primaryPressed}>
                {plan.calorieTarget}
              </AppText>
              <AppText variant="bodyStrong" color={palette.primaryPressed} style={styles.planUnit}>
                {t('common.kcal')}
              </AppText>
            </View>
            <AppText variant="caption" color={palette.primaryPressed}>
              {t('onboarding.calorieHelp')}
            </AppText>
            <View style={styles.planDivider} />
            <AppText variant="caption" color={palette.primaryPressed}>
              BMI {plan.bmi.toFixed(1)} · BMR {plan.bmr} · TDEE {plan.tdee}
            </AppText>
          </Card>

          <Card tone="muted" style={styles.privacyCard}>
            <AppText variant="caption">{t('onboarding.privacyNote')}</AppText>
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: { gap: spacing.md },
  layoutWide: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xl },
  column: { gap: 0 },
  columnWide: { flex: 1, minWidth: 0 },
  card: { gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  block: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  planCard: { marginTop: spacing.md, gap: spacing.sm, borderWidth: 0 },
  planRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  planUnit: { paddingBottom: 8 },
  planDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.primaryBorder,
    marginVertical: spacing.xs,
  },
  privacyCard: { marginTop: spacing.md, borderWidth: 0 },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
});
