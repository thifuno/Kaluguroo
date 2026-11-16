import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  right?: ReactNode;
}

export function SectionHeader({ title, actionLabel, onAction, right }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subheading" style={styles.title}>
        {title}
      </AppText>
      {right}
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          hitSlop={4}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}>
          <AppText variant="label" color={palette.primaryPressed}>
            {actionLabel}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={palette.primaryPressed} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  title: { flexShrink: 1 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
});
