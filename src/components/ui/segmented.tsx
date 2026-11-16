import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, spacing } from '@/constants/theme';
import { useTextScale } from '@/store/text-scale-provider';

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const { scale } = useTextScale();

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            aria-pressed={selected}
            onPress={() => onChange(option.value)}
            style={[styles.item, selected && styles.itemSelected]}>
            <View style={[styles.itemContent, { minHeight: Math.round(44 * Math.min(scale, 1.2)) }]}>
              {selected ? (
                <Ionicons name="checkmark" size={17} color={palette.primaryPressed} />
              ) : null}
              <AppText
                variant="label"
                align="center"
                color={selected ? palette.primaryPressed : palette.textMuted}
                style={selected ? styles.selectedLabel : undefined}>
                {option.label}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.lg,
    padding: 4,
    gap: 4,
  },
  item: {
    flex: 1,
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  itemSelected: {
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  selectedLabel: { fontWeight: '700' },
});
