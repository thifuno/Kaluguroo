import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { palette, spacing } from '@/constants/theme';
import { useApp } from '@/store/app-provider';
import type { FoodCategory } from '@/types/models';

interface CustomFoodSheetProps {
  visible: boolean;
  onClose: () => void;
}

const EMPTY = {
  name: '',
  servingLabel: '1 จาน',
  servingGrams: '250',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
};

export function CustomFoodSheet({ visible, onClose }: CustomFoodSheetProps) {
  const { t, addCustomFood } = useApp();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof EMPTY, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = () => {
    const calories = Number(form.calories.replace(',', '.'));
    if (!form.name.trim()) {
      setError(t('food.validationName'));
      return;
    }
    if (!Number.isFinite(calories) || calories < 0 || calories > 3000) {
      setError(t('food.validationCalories'));
      return;
    }

    addCustomFood({
      name: form.name.trim(),
      nameEn: form.name.trim(),
      category: 'other' as FoodCategory,
      servingLabel: form.servingLabel.trim() || '1 serving',
      servingGrams: Number(form.servingGrams.replace(',', '.')) || 0,
      calories,
      protein: Number(form.protein.replace(',', '.')) || 0,
      carbs: Number(form.carbs.replace(',', '.')) || 0,
      fat: Number(form.fat.replace(',', '.')) || 0,
    });
    toast(t('food.customSaved'), 'success');
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={t('food.customTitle')}
      subtitle={t('food.customSubtitle')}
      footer={<Button label={t('common.save')} onPress={save} />}>
      <TextField
        label={t('food.name')}
        value={form.name}
        onChangeText={(value) => update('name', value)}
        placeholder="ข้าวผัดบ้านฉัน"
      />

      <View style={styles.row}>
        <TextField
          label={t('food.servingLabel')}
          value={form.servingLabel}
          onChangeText={(value) => update('servingLabel', value)}
          containerStyle={styles.flex}
        />
        <TextField
          label={t('food.servingGrams')}
          value={form.servingGrams}
          onChangeText={(value) => update('servingGrams', value)}
          keyboardType="decimal-pad"
          containerStyle={styles.flex}
        />
      </View>

      <TextField
        label={`${t('food.calories')} (${t('common.kcal')})`}
        value={form.calories}
        onChangeText={(value) => update('calories', value)}
        keyboardType="decimal-pad"
        placeholder="450"
        error={error}
      />

      <View style={styles.row}>
        <TextField
          label={`${t('food.protein')} (g)`}
          value={form.protein}
          onChangeText={(value) => update('protein', value)}
          keyboardType="decimal-pad"
          containerStyle={styles.flex}
        />
        <TextField
          label={`${t('food.carbs')} (g)`}
          value={form.carbs}
          onChangeText={(value) => update('carbs', value)}
          keyboardType="decimal-pad"
          containerStyle={styles.flex}
        />
        <TextField
          label={`${t('food.fat')} (g)`}
          value={form.fat}
          onChangeText={(value) => update('fat', value)}
          keyboardType="decimal-pad"
          containerStyle={styles.flex}
        />
      </View>

      <AppText variant="caption" color={palette.textMuted}>
        {t('onboarding.disclaimer')}
      </AppText>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
