import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, spacing } from '@/constants/theme';

interface CalorieBarsProps {
  data: { date: string; label: string; calories: number }[];
  target: number;
}

export function CalorieBars({ data, target }: CalorieBarsProps) {
  const max = Math.max(target, ...data.map((item) => item.calories), 1);

  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const ratio = item.calories > 0 ? Math.min(item.calories / max, 1) : 0;
        const isToday = index === data.length - 1;
        const over = item.calories > target;
        return (
          <View key={item.date} style={styles.column}>
            <AppText
              variant="caption"
              style={[styles.value, isToday && { color: palette.primaryPressed, fontWeight: '700' }]}>
              {item.calories > 0 ? Math.round(item.calories) : '-'}
            </AppText>
            <View style={styles.track}>
              {item.calories > 0 ? (
                <View
                  style={[
                    styles.fill,
                    {
                      height: `${ratio * 100}%`,
                      backgroundColor: over ? palette.warningText : palette.primaryAction,
                    },
                  ]}
                />
              ) : null}
            </View>
            <AppText
              variant="caption"
              style={isToday ? styles.todayLabel : undefined}
              numberOfLines={1}>
              {item.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
    minHeight: 190,
  },
  column: { flex: 1, alignItems: 'center', gap: 4 },
  value: {},
  track: {
    width: '100%',
    maxWidth: 38,
    height: 124,
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceMuted,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fill: { width: '100%', borderRadius: radius.sm },
  todayLabel: { color: palette.primaryPressed, fontWeight: '700' },
});
