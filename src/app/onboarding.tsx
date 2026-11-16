import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Logo } from '@/components/ui/logo';
import { Segmented } from '@/components/ui/segmented';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { palette, radius, spacing } from '@/constants/theme';
import type { TranslationKey } from '@/lib/i18n';
import { calcPlan } from '@/lib/nutrition';
import { useApp } from '@/store/app-provider';
import type { ActivityLevel, Gender, HealthGoal, HealthProfile } from '@/types/models';

const TOTAL_STEPS = 4;

const ACTIVITIES: {
  value: ActivityLevel;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: 'sedentary', titleKey: 'onboarding.activity.sedentary', descKey: 'onboarding.activity.sedentary.desc', icon: 'cafe-outline' },
  { value: 'light', titleKey: 'onboarding.activity.light', descKey: 'onboarding.activity.light.desc', icon: 'walk-outline' },
  { value: 'moderate', titleKey: 'onboarding.activity.moderate', descKey: 'onboarding.activity.moderate.desc', icon: 'bicycle-outline' },
  { value: 'active', titleKey: 'onboarding.activity.active', descKey: 'onboarding.activity.active.desc', icon: 'barbell-outline' },
  { value: 'very_active', titleKey: 'onboarding.activity.very_active', descKey: 'onboarding.activity.very_active.desc', icon: 'flash-outline' },
];

const GOALS: {
  value: HealthGoal;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: 'lose', titleKey: 'onboarding.goal.lose', descKey: 'onboarding.goal.lose.desc', icon: 'trending-down-outline' },
  { value: 'maintain', titleKey: 'onboarding.goal.maintain', descKey: 'onboarding.goal.maintain.desc', icon: 'remove-outline' },
  { value: 'gain', titleKey: 'onboarding.goal.gain', descKey: 'onboarding.goal.gain.desc', icon: 'trending-up-outline' },
];

export default function OnboardingScreen() {
  const { t, session, profile, completeOnboarding } = useApp();
  const { name: nameParam } = useLocalSearchParams<{ name?: string }>();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender>('female');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<HealthGoal>('lose');
  const [age, setAge] = useState('29');
  const [height, setHeight] = useState('165');
  const [weight, setWeight] = useState('62.5');
  const [target, setTarget] = useState('58');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);

  const displayName =
    profile?.displayName ??
    (typeof nameParam === 'string' && nameParam.trim() ? nameParam.trim() : null) ??
    session?.email.split('@')[0] ??
    'Kaluguroo';

  const parsed = useMemo(
    () => ({
      age: Number(age.replace(',', '.')),
      height: Number(height.replace(',', '.')),
      weight: Number(weight.replace(',', '.')),
      target: Number(target.replace(',', '.')),
    }),
    [age, height, weight, target],
  );

  const draftProfile: HealthProfile = useMemo(
    () => ({
      displayName,
      age: Number.isFinite(parsed.age) ? parsed.age : 30,
      gender,
      heightCm: Number.isFinite(parsed.height) ? parsed.height : 170,
      weightKg: Number.isFinite(parsed.weight) ? parsed.weight : 60,
      targetWeightKg: Number.isFinite(parsed.target) ? parsed.target : 58,
      activityLevel: activity,
      goal,
    }),
    [displayName, parsed, gender, activity, goal],
  );

  const plan = useMemo(() => calcPlan(draftProfile), [draftProfile]);

  const validateBasics = () => {
    const next: Record<string, string | null> = {};
    if (!(parsed.age >= 13 && parsed.age <= 100)) next.age = t('onboarding.ageError');
    if (!(parsed.height >= 100 && parsed.height <= 250)) next.height = t('onboarding.heightError');
    if (!(parsed.weight >= 30 && parsed.weight <= 300)) next.weight = t('onboarding.weightError');
    if (!(parsed.target >= 30 && parsed.target <= 300)) next.target = t('onboarding.targetWeightError');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateBasics()) return;
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      void finish();
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      await completeOnboarding(draftProfile);
      toast(t('onboarding.start'), 'success');
      router.replace('/(tabs)');
    } catch {
      toast(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const steps: { titleKey: TranslationKey; helpKey: TranslationKey }[] = [
    { titleKey: 'onboarding.stepBody', helpKey: 'onboarding.bodyHelp' },
    { titleKey: 'onboarding.stepActivity', helpKey: 'onboarding.activityHelp' },
    { titleKey: 'onboarding.stepGoal', helpKey: 'onboarding.goalHelp' },
    { titleKey: 'onboarding.stepSummary', helpKey: 'onboarding.summaryHelp' },
  ];
  const current = steps[step];

  return (
    <Screen
      bottomInset={spacing.lg}
      maxWidth={640}
      footer={
        <View style={styles.footer}>
          {step > 0 ? (
            <Button
              label={t('common.back')}
              onPress={() => setStep(step - 1)}
              variant="secondary"
              icon="arrow-back"
              style={styles.backButton}
            />
          ) : null}
          <Button
            label={step === TOTAL_STEPS - 1 ? t('onboarding.start') : t('common.continue')}
            onPress={next}
            loading={saving}
            icon={step === TOTAL_STEPS - 1 ? 'checkmark' : 'arrow-forward'}
            iconPosition="right"
            style={styles.nextButton}
          />
        </View>
      }>
      <View style={styles.topRow}>
        <Logo size={40} />
        <AppText variant="label" color={palette.primaryPressed}>
          {t('onboarding.step', { current: step + 1, total: TOTAL_STEPS })}
        </AppText>
      </View>

      <View style={styles.progress}>
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <View
            key={index}
            style={[styles.progressBar, index <= step && styles.progressBarActive]}
          />
        ))}
      </View>

      <View style={styles.heading}>
        <AppText variant="heading">{t(current.titleKey)}</AppText>
        <AppText variant="body" color={palette.textMuted}>
          {t(current.helpKey)}
        </AppText>
      </View>

      {step === 0 ? (
        <View style={styles.section}>
          <View style={styles.fieldRow}>
            <TextField
              label={t('onboarding.age')}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              suffix={t('common.years')}
              error={errors.age}
              containerStyle={styles.half}
            />
            <TextField
              label={t('onboarding.height')}
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              suffix={t('common.cm')}
              error={errors.height}
              containerStyle={styles.half}
            />
          </View>

          <View style={styles.genderBlock}>
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

          <View style={styles.fieldRow}>
            <TextField
              label={t('onboarding.weight')}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              suffix={t('common.kg')}
              error={errors.weight}
              containerStyle={styles.half}
            />
            <TextField
              label={t('onboarding.targetWeight')}
              value={target}
              onChangeText={setTarget}
              keyboardType="decimal-pad"
              suffix={t('common.kg')}
              error={errors.target}
              containerStyle={styles.half}
            />
          </View>

          <View style={styles.privacy}>
            <Ionicons name="lock-closed-outline" size={19} color={palette.textMuted} />
            <AppText variant="caption" style={styles.privacyText}>
              {t('onboarding.privacyNote')}
            </AppText>
          </View>
        </View>
      ) : null}

      {step === 1 ? (
        <View style={styles.options}>
          {ACTIVITIES.map((option) => (
            <OptionRow
              key={option.value}
              icon={option.icon}
              title={t(option.titleKey)}
              description={t(option.descKey)}
              selected={activity === option.value}
              onPress={() => setActivity(option.value)}
            />
          ))}
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.options}>
          {GOALS.map((option) => (
            <OptionRow
              key={option.value}
              icon={option.icon}
              title={t(option.titleKey)}
              description={t(option.descKey)}
              selected={goal === option.value}
              onPress={() => setGoal(option.value)}
            />
          ))}
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.summary}>
          <Card tone="primary" style={styles.calorieCard}>
            <AppText variant="label" color={palette.primaryPressed}>
              {t('onboarding.calorieTarget')}
            </AppText>
            <View style={styles.calorieRow}>
              <AppText variant="display" color={palette.primaryPressed}>
                {plan.calorieTarget}
              </AppText>
              <AppText variant="bodyStrong" color={palette.primaryPressed} style={styles.calorieUnit}>
                {t('common.kcal')} / {t('common.today')}
              </AppText>
            </View>
            <AppText variant="body" color={palette.primaryPressed}>
              {t('onboarding.calorieHelp')}
            </AppText>
          </Card>

          <View style={styles.statRow}>
            {[
              { label: t('onboarding.bmi'), value: plan.bmi.toFixed(1), unit: '' },
              { label: t('onboarding.bmr'), value: `${plan.bmr}`, unit: t('common.kcal') },
              { label: t('onboarding.tdee'), value: `${plan.tdee}`, unit: t('common.kcal') },
            ].map((stat) => (
              <Card key={stat.label} style={styles.statCard}>
                <AppText variant="caption" numberOfLines={2}>
                  {stat.label}
                </AppText>
                <AppText variant="subheading">{stat.value}</AppText>
                {stat.unit ? <AppText variant="caption">{stat.unit}</AppText> : null}
              </Card>
            ))}
          </View>

          <Card tone="muted" style={styles.explainCard}>
            {[
              { label: t('onboarding.bmi'), text: t('onboarding.whatIsBmi'), icon: 'body-outline' as const },
              { label: t('onboarding.bmr'), text: t('onboarding.whatIsBmr'), icon: 'flame-outline' as const },
              { label: t('onboarding.tdee'), text: t('onboarding.whatIsTdee'), icon: 'sunny-outline' as const },
            ].map((item) => (
              <View key={item.label} style={styles.explainRow}>
                <Ionicons name={item.icon} size={19} color={palette.textMuted} />
                <View style={styles.explainText}>
                  <AppText variant="bodyStrong">{item.label}</AppText>
                  <AppText variant="caption">{item.text}</AppText>
                </View>
              </View>
            ))}
          </Card>

          <Card style={styles.macroCard}>
            <AppText variant="bodyStrong">{t('onboarding.macros')}</AppText>
            <View style={styles.macroRow}>
              <Chip label={`${t('onboarding.protein')} ${plan.proteinG}g`} selected />
              <Chip label={`${t('onboarding.carbs')} ${plan.carbsG}g`} selected />
              <Chip label={`${t('onboarding.fat')} ${plan.fatG}g`} selected />
            </View>
          </Card>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={19} color={palette.textMuted} />
            <AppText variant="caption" style={styles.disclaimerText}>
              {t('onboarding.disclaimer')}
            </AppText>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function OptionRow({
  icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ checked: selected, selected }}
      aria-checked={selected}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && { opacity: 0.85 },
      ]}>
      <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
        <Ionicons
          name={icon}
          size={22}
          color={selected ? palette.white : palette.primaryPressed}
        />
      </View>
      <View style={styles.optionText}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="caption">{description}</AppText>
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={26}
        color={selected ? palette.primaryAction : palette.borderStrong}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  progress: { flexDirection: 'row', gap: 6, marginTop: spacing.lg },
  progressBar: {
    flex: 1,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceMuted,
  },
  progressBarActive: { backgroundColor: palette.primaryAction },
  heading: { marginTop: spacing.xl, gap: spacing.xs + 2 },
  section: { marginTop: spacing.xl, gap: spacing.lg },
  fieldRow: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  genderBlock: { gap: spacing.sm },
  privacy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  privacyText: { flex: 1 },
  options: { marginTop: spacing.xl, gap: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    minHeight: 72,
  },
  optionSelected: { borderColor: palette.primaryAction, backgroundColor: palette.primarySoft },
  optionIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: { backgroundColor: palette.primaryAction },
  optionText: { flex: 1, gap: 2 },
  summary: { marginTop: spacing.xl, gap: spacing.md },
  calorieCard: { gap: spacing.sm, borderWidth: 0 },
  calorieRow: { flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', gap: spacing.sm },
  calorieUnit: { paddingBottom: 6 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: { flex: 1, minWidth: 96, gap: 2, alignItems: 'center', paddingVertical: spacing.md },
  explainCard: { gap: spacing.md, borderWidth: 0 },
  explainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  explainText: { flex: 1, gap: 1 },
  macroCard: { gap: spacing.md },
  macroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.sm },
  disclaimerText: { flex: 1 },
  footer: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: palette.background,
  },
  backButton: { flexShrink: 0 },
  nextButton: { flex: 1 },
});
