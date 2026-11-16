import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { useToast } from '@/components/ui/toast';
import { palette, radius, spacing } from '@/constants/theme';
import { useApp } from '@/store/app-provider';
import type { FoodItem, MealType } from '@/types/models';

interface FoodDetailSheetProps {
  food: FoodItem | null;
  visible: boolean;
  onClose: () => void;
}

const MEALS: { value: MealType; labelKey: 'home.breakfast' | 'home.lunch' | 'home.dinner' | 'home.snack' }[] = [
  { value: 'breakfast', labelKey: 'home.breakfast' },
  { value: 'lunch', labelKey: 'home.lunch' },
  { value: 'dinner', labelKey: 'home.dinner' },
  { value: 'snack', labelKey: 'home.snack' },
];

function defaultMeal(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

export function FoodDetailSheet({ food, visible, onClose }: FoodDetailSheetProps) {
  const { t, addFoodLog, toggleFavorite, favoriteFoodIds } = useApp();
  const toast = useToast();
  const [servings, setServings] = useState(1);
  const [meal, setMeal] = useState<MealType>(defaultMeal());

  if (!food) return null;

  const isFavorite = favoriteFoodIds.includes(food.id);
  const calories = Math.round(food.calories * servings);
  const macros = [
    { label: t('food.protein'), value: food.protein * servings, color: palette.protein },
    { label: t('food.carbs'), value: food.carbs * servings, color: palette.carbs },
    { label: t('food.fat'), value: food.fat * servings, color: palette.fat },
  ];

  const add = () => {
    addFoodLog({ food, meal, servings, source: food.isCustom ? 'custom' : 'manual' });
    toast(t('food.added'), 'success');
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={food.name}
      subtitle={food.nameEn}
      footer={
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? t('food.removeFromFavorites') : t('food.addToFavorites')
            }
            onPress={() => toggleFavorite(food.id)}
            style={[styles.favorite, isFavorite && styles.favoriteActive]}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? palette.white : palette.primaryPressed}
            />
          </Pressable>
          <Button
            label={`${t('food.addToDiary')} · ${calories} ${t('common.kcal')}`}
            onPress={add}
            style={styles.addButton}
          />
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
        <Badge
          tone="neutral"
          label={`${food.servingLabel} · ${Math.round(food.servingGrams * servings)} g`}
        />
      </View>

      <View style={styles.macroRow}>
        {macros.map((macro) => (
          <View key={macro.label} style={styles.macroCell}>
            <View style={[styles.dot, { backgroundColor: macro.color }]} />
            <AppText variant="caption">{macro.label}</AppText>
            <AppText variant="bodyStrong">{Math.round(macro.value * 10) / 10} g</AppText>
          </View>
        ))}
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
            onPress={() => setServings((value) => Math.max(0.5, Math.round((value - 0.5) * 10) / 10))}
            style={[styles.stepButton, servings <= 0.5 && styles.stepDisabled]}>
            <Ionicons name="remove" size={20} color={palette.text} />
          </Pressable>
          <View style={styles.stepValue}>
            <AppText variant="subheading">{servings.toFixed(1)}</AppText>
            <AppText variant="caption">{food.servingLabel}</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('food.increaseServings')}
            disabled={servings >= 10}
            onPress={() => setServings((value) => Math.min(10, Math.round((value + 0.5) * 10) / 10))}
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

      <AppText variant="caption">
        {t('food.perServing', { serving: food.servingLabel })}: {food.calories} {t('common.kcal')} ·{' '}
        {food.protein}g {t('food.protein')} · {food.carbs}g {t('food.carbs')} · {food.fat}g{' '}
        {t('food.fat')}
      </AppText>
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
  macroRow: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  macroCell: { flex: 1, alignItems: 'center', gap: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
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
  stepValue: { alignItems: 'center', gap: 0 },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footer: { flexDirection: 'row', gap: spacing.sm },
  favorite: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.primaryBorder,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteActive: { backgroundColor: palette.primaryAction, borderColor: palette.primaryAction },
  addButton: { flex: 1 },
});
