import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, spacing } from '@/constants/theme';
import { useTextScale } from '@/store/text-scale-provider';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md';
}

export function Chip({ label, selected = false, onPress, icon, size = 'md' }: ChipProps) {
  const { scale } = useTextScale();
  const minHeight = Math.round((size === 'sm' ? 40 : 46) * Math.min(scale, 1.2));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight,
          backgroundColor: selected ? palette.primaryAction : palette.surface,
          borderColor: selected ? palette.primaryAction : palette.borderStrong,
          paddingVertical: size === 'sm' ? spacing.sm : 10,
          paddingHorizontal: size === 'sm' ? spacing.sm + 2 : spacing.md + 2,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      {selected ? (
        <Ionicons name="checkmark" size={16} color={palette.white} />
      ) : icon ? (
        <Ionicons name={icon} size={16} color={palette.textMuted} />
      ) : null}
      <AppText
        variant={size === 'sm' ? 'caption' : 'label'}
        color={selected ? palette.white : palette.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
