import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState } from '@/components/ui/states';
import { TextField } from '@/components/ui/text-field';
import { palette, radius, spacing } from '@/constants/theme';
import { searchFoods } from '@/constants/foods';
import { CustomFoodSheet } from '@/features/food/custom-food-sheet';
import { FoodDetailSheet } from '@/features/food/food-detail-sheet';
import type { TranslationKey } from '@/lib/i18n';
import { useResponsive } from '@/lib/responsive';
import { useApp } from '@/store/app-provider';
import type { FoodCategory, FoodItem } from '@/types/models';

const CATEGORIES: { value: 'all' | FoodCategory; labelKey: TranslationKey }[] = [
  { value: 'all', labelKey: 'food.all' },
  { value: 'rice', labelKey: 'food.category.rice' },
  { value: 'noodles', labelKey: 'food.category.noodles' },
  { value: 'soup', labelKey: 'food.category.soup' },
  { value: 'meat', labelKey: 'food.category.meat' },
  { value: 'seafood', labelKey: 'food.category.seafood' },
  { value: 'vegetable', labelKey: 'food.category.vegetable' },
  { value: 'fruit', labelKey: 'food.category.fruit' },
  { value: 'dessert', labelKey: 'food.category.dessert' },
  { value: 'drink', labelKey: 'food.category.drink' },
  { value: 'snack', labelKey: 'food.category.snack' },
];

export default function FoodScreen() {
  const { t, allFoods, favoriteFoodIds, toggleFavorite, todayTotals, plan } = useApp();
  const { isWide } = useResponsive();
  const params = useLocalSearchParams<{ custom?: string }>();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | FoodCategory>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [customVisible, setCustomVisible] = useState(false);
  // Bumping these keys remounts the sheets so their form state starts fresh.
  const [detailNonce, setDetailNonce] = useState(0);
  const [customNonce, setCustomNonce] = useState(0);

  const favorites = allFoods.filter((food) => favoriteFoodIds.includes(food.id));

  const filtered = useMemo(() => {
    let list = searchFoods(allFoods, query);
    if (category !== 'all') list = list.filter((food) => food.category === category);
    if (favoritesOnly) list = list.filter((food) => favoriteFoodIds.includes(food.id));
    return list;
  }, [allFoods, query, category, favoritesOnly, favoriteFoodIds]);

  const openFood = (food: FoodItem) => {
    setSelectedFood(food);
    setDetailNonce((value) => value + 1);
    setDetailVisible(true);
  };

  const openCustom = () => {
    setCustomNonce((value) => value + 1);
    setCustomVisible(true);
  };

  // The scan screen sends people here with ?custom=1 when AI is unavailable.
  // Derive the sheet from the URL instead of syncing it in an effect, so the
  // form opens on the first render without a cascading state update.
  const customRequested = params.custom === '1';

  const closeCustom = () => {
    setCustomVisible(false);
    if (customRequested) router.setParams({ custom: '' });
  };

  const categoryTitle = favoritesOnly
    ? t('food.favoritesOnly')
    : category === 'all'
      ? t('food.all')
      : t(CATEGORIES.find((item) => item.value === category)?.labelKey ?? 'food.all');

  const favoritesSection =
    favorites.length > 0 && !favoritesOnly ? (
      <>
        <SectionHeader title={t('food.favorites')} />
        <Card padded={false} style={styles.listCard}>
          {favorites.slice(0, isWide ? 6 : 3).map((food, index) => (
            <FoodRow
              key={food.id}
              food={food}
              last={index === Math.min(favorites.length, isWide ? 6 : 3) - 1}
              favorite
              onOpen={() => openFood(food)}
              onFavorite={() => toggleFavorite(food.id)}
              caloriesLabel={t('common.kcal')}
              servingLabel={t('food.perServing', { serving: food.servingLabel })}
              addLabel={t('common.add')}
              favoriteLabel={t('food.favorite')}
              removeFavoriteLabel={t('food.removeFromFavorites')}
            />
          ))}
        </Card>
      </>
    ) : null;

  const listSection = (
    <>
      <SectionHeader title={categoryTitle} right={<Badge label={`${filtered.length}`} tone="neutral" />} />

      {filtered.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title={t('food.noResults')}
          body={t('food.noResultsBody')}
          actionLabel={t('food.addCustom')}
          onAction={openCustom}
        />
      ) : (
        <Card padded={false} style={styles.listCard}>
          {filtered.map((food, index) => (
            <FoodRow
              key={food.id}
              food={food}
              last={index === filtered.length - 1}
              favorite={favoriteFoodIds.includes(food.id)}
              onOpen={() => openFood(food)}
              onFavorite={() => toggleFavorite(food.id)}
              caloriesLabel={t('common.kcal')}
              servingLabel={t('food.perServing', { serving: food.servingLabel })}
              addLabel={t('common.add')}
              favoriteLabel={t('food.favorite')}
              removeFavoriteLabel={t('food.removeFromFavorites')}
            />
          ))}
        </Card>
      )}
    </>
  );

  const categoryChips = (
    <>
      {CATEGORIES.map((item) => (
        <Chip
          key={item.value}
          label={t(item.labelKey)}
          selected={!favoritesOnly && category === item.value}
          onPress={() => {
            setFavoritesOnly(false);
            setCategory(item.value);
          }}
        />
      ))}
      <Chip
        label={t('food.favorites')}
        icon="heart-outline"
        selected={favoritesOnly}
        onPress={() => setFavoritesOnly((value) => !value)}
      />
    </>
  );

  return (
    <Screen>
      <ScreenHeader title={t('food.title')} subtitle={t('food.subtitle')} helpTopic="food" />

      <Button
        label={t('food.addCustom')}
        onPress={openCustom}
        icon="add"
        variant="soft"
        accessibilityHint={t('food.addCustomCta')}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('diary.open')}
        onPress={() => router.push('/diary')}
        style={({ pressed }) => [styles.totalPressable, pressed && { opacity: 0.85 }]}>
        <Card style={styles.totalCard} tone="surface">
          <View style={styles.totalRow}>
            <View style={styles.totalText}>
              <AppText variant="caption">{t('food.todayTotal')}</AppText>
              <View style={styles.totalValue}>
                <AppText variant="title" color={palette.primaryPressed}>
                  {Math.round(todayTotals.calories)}
                </AppText>
                <AppText variant="caption">
                  / {plan?.calorieTarget ?? 2000} {t('common.kcal')}
                </AppText>
              </View>
            </View>
            <View style={styles.macroCol}>
              <AppText variant="caption" color={palette.proteinText}>
                {t('home.protein')} {Math.round(todayTotals.protein)}g
              </AppText>
              <AppText variant="caption" color={palette.carbsText}>
                {t('home.carbs')} {Math.round(todayTotals.carbs)}g
              </AppText>
              <AppText variant="caption" color={palette.fatText}>
                {t('home.fat')} {Math.round(todayTotals.fat)}g
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
          </View>
        </Card>
      </Pressable>

      <View style={styles.search}>
        <TextField
          label={t('common.search')}
          value={query}
          onChangeText={setQuery}
          placeholder={t('food.searchPlaceholder')}
          icon="search-outline"
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {isWide ? (
        <View style={styles.chipsWide}>{categoryChips}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipScroll}>
          {categoryChips}
        </ScrollView>
      )}

      {isWide && favoritesSection ? (
        <View style={styles.wideRow}>
          <View style={styles.wideSide}>{favoritesSection}</View>
          <View style={styles.wideMain}>{listSection}</View>
        </View>
      ) : (
        <>
          {favoritesSection}
          {listSection}
        </>
      )}

      <AppText variant="caption" align="center" style={styles.note}>
        {t('onboarding.disclaimer')}
      </AppText>

      <FoodDetailSheet
        key={`${selectedFood?.id ?? 'none'}-${detailNonce}`}
        food={selectedFood}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
      <CustomFoodSheet
        key={customNonce}
        visible={customVisible || customRequested}
        onClose={closeCustom}
      />
    </Screen>
  );
}

function FoodRow({
  food,
  favorite,
  last,
  onOpen,
  onFavorite,
  caloriesLabel,
  servingLabel,
  addLabel,
  favoriteLabel,
  removeFavoriteLabel,
}: {
  food: FoodItem;
  favorite: boolean;
  last: boolean;
  onOpen: () => void;
  onFavorite: () => void;
  caloriesLabel: string;
  servingLabel: string;
  addLabel: string;
  favoriteLabel: string;
  removeFavoriteLabel: string;
}) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${food.name}, ${Math.round(food.calories)} ${caloriesLabel}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.7 }]}>
        <View style={styles.foodIcon}>
          <Ionicons name="restaurant-outline" size={20} color={palette.primaryPressed} />
        </View>
        <View style={styles.foodText}>
          <AppText variant="bodyStrong" numberOfLines={2}>
            {food.name}
          </AppText>
          <AppText variant="caption" numberOfLines={2}>
            {servingLabel} · {Math.round(food.calories)} {caloriesLabel}
          </AppText>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={favorite ? removeFavoriteLabel : favoriteLabel}
        onPress={onFavorite}
        style={({ pressed }) => [styles.heart, pressed && { opacity: 0.6 }]}>
        <Ionicons
          name={favorite ? 'heart' : 'heart-outline'}
          size={23}
          color={favorite ? palette.primaryPressed : palette.textMuted}
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${addLabel} ${food.name}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.addSmall, pressed && { opacity: 0.7 }]}>
        <Ionicons name="add" size={19} color={palette.primaryPressed} />
        <AppText variant="label" color={palette.primaryPressed}>
          {addLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  totalPressable: { marginTop: spacing.md },
  totalCard: { borderWidth: 0, backgroundColor: palette.primarySoft },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  totalText: { flex: 1 },
  totalValue: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  macroCol: { alignItems: 'flex-end', gap: 2 },
  search: { marginTop: spacing.lg },
  chipScroll: { marginTop: spacing.md, marginHorizontal: -spacing.xl },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: 2 },
  chipsWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: 2,
  },
  wideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
  },
  wideSide: { width: 320 },
  wideMain: { flex: 1, minWidth: 0 },
  listCard: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingRight: spacing.sm },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 68,
  },
  foodIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodText: { flex: 1, gap: 1 },
  heart: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSmall: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
  },
  note: { marginTop: spacing.xl },
});
