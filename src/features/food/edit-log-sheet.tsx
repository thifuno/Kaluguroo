import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { useToast } from '@/components/ui/toast';
import { palette, radius, spacing } from '@/constants/theme';
import { confirmDestructive } from '@/lib/confirm';
import { useApp } from '@/store/app-provider';
import type { FoodLog, MealType } from '@/types/models';

interface EditLogSheetProps {
  log: FoodLog | null;
  visible: boolean;
  onClose: () => void;
}

const MEALS: { value: MealType; labelKey: 'home.breakfast' | 'home.lunch' | 'home.dinner' | 'home.snack' }[] = [
  { value: 'breakfast', labelKey: 'home.breakfast' },
  { value: 'lunch', labelKey: 'home.lunch' },
  { value: 'dinner', labelKey: 'home.dinner' },
  { value: 'snack', labelKey: 'home.snack' },
];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function EditLogSheet({ log, visible, onClose }: EditLogSheetProps) {
  const { t, allFoods, updateFoodLog, deleteFoodLog } = useApp();
  const toast = useToast();
  const [servings, setServings] = useState(log?.servings ?? 1);
  const [meal, setMeal] = useState<MealType>(log?.meal ?? 'breakfast');

  if (!log) return null;

  // Prefer the food's per-serving values so edits stay consistent with the database.
  const food = allFoods.find((item) => item.id === log.foodId);
  const base = food ?? {
    calories: log.calories / (log.servings || 1),
    protein: log.protein / (log.servings || 1),
    carbs: log.carbs / (log.servings || 1),
    fat: log.fat / (log.servings || 1),
  };

  const calories = Math.round(base.calories * servings);
  const protein = round1(base.protein * servings);
  const carbs = round1(base.carbs * servings);
  const fat = round1(base.fat * servings);

  const save = () => {
    updateFoodLog(log.id, { servings, meal, calories, protein, carbs, fat });
    toast(t('diary.updated'), 'success');
    onClose();
  };

  const remove = async () => {
    const confirmed = await confirmDestructive({
      title: t('diary.deleteTitle'),
      message: t('diary.deleteBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    });
    if (!confirmed) return;
    deleteFoodLog(log.id);
    toast(t('diary.deleted'), 'info');
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={log.name}
      subtitle={t('diary.editTitle')}
      footer={
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.delete')}
            onPress={() => void remove()}
            style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]}>
            <Ionicons name="trash-outline" size={22} color={palette.danger} />
          </Pressable>
          <Button label={t('common.save')} onPress={save} style={styles.saveButton} />
        </View>
      }>
      <View style={styles.hero}>
        <View>
          <AppText variant="caption">{t('food.calories')}</AppText>
          <View style={styles.calorieRow}>
            <AppText variant="title" color={palette.primaryPressed}>
              {calories}
            </AppText>
            <AppText variant="caption">{t('common.kcal')}</AppText>
          </View>
        </View>
        <AppText variant="caption">
          {protein}g {t('food.protein')} · {carbs}g {t('food.carbs')} · {fat}g {t('food.fat')}
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="label" color={palette.textMuted}>
          {t('food.servings')}
        </AppText>
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('food.decreaseServings')}
            disabled={servings <= 0.5}
            onPress={() => setServings((value) => Math.max(0.5, round1(value - 0.5)))}
            style={[styles.stepButton, servings <= 0.5 && styles.stepDisabled]}>
            <Ionicons name="remove" size={20} color={palette.text} />
          </Pressable>
          <View style={styles.stepValue}>
            <AppText variant="subheading">{servings.toFixed(1)}</AppText>
            <AppText variant="caption">{food ? food.servingLabel : t('food.servings')}</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('food.increaseServings')}
            disabled={servings >= 10}
            onPress={() => setServings((value) => Math.min(10, round1(value + 0.5)))}
            style={[styles.stepButton, servings >= 10 && styles.stepDisabled]}>
            <Ionicons name="add" size={20} color={palette.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="label" color={palette.textMuted}>
          {t('food.chooseMeal')}
        </AppText>
        <View style={styles.mealRow}>
          {MEALS.map((option) => (
            <Chip
              key={option.value}
              label={t(option.labelKey)}
              selected={meal === option.value}
              onPress={() => setMeal(option.value)}
            />
          ))}
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  calorieRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  section: { gap: spacing.sm },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.sm,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: { opacity: 0.4 },
  stepValue: { alignItems: 'center' },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footer: { flexDirection: 'row', gap: spacing.sm },
  deleteButton: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.danger,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: { flex: 1 },
});
