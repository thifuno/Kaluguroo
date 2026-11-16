import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, spacing } from '@/constants/theme';

interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
}

export function MacroBar({ label, value, target, color, unit = 'g' }: MacroBarProps) {
  const ratio = target > 0 ? Math.min(value / target, 1) : 0;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.legend}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <AppText variant="body" color={palette.text}>
            {label}
          </AppText>
        </View>
        <AppText variant="mono" color={palette.textMuted}>
          {Math.round(value)} / {Math.round(target)} {unit}
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  track: {
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
});

export function MacroChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={chipStyles.wrapper}>
      <View style={[chipStyles.dot, { backgroundColor: color }]} />
      <View>
        <AppText variant="caption">{label}</AppText>
        <AppText variant="bodyStrong">{Math.round(value)} g</AppText>
      </View>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
