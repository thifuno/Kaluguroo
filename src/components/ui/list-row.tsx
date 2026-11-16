import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, spacing } from '@/constants/theme';

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBackground?: string;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  danger?: boolean;
  showDivider?: boolean;
  accessibilityLabel?: string;
}

export function ListRow({
  title,
  subtitle,
  icon,
  iconColor = palette.primaryPressed,
  iconBackground = palette.primarySoft,
  right,
  onPress,
  chevron = false,
  danger = false,
  showDivider = false,
  accessibilityLabel,
}: ListRowProps) {
  const body = (
    <View style={[styles.container, showDivider && styles.divider]}>
      {icon ? (
        <View
          style={[styles.icon, { backgroundColor: danger ? palette.dangerSoft : iconBackground }]}>
          <Ionicons name={icon} size={21} color={danger ? palette.dangerText : iconColor} />
        </View>
      ) : null}
      <View style={styles.text}>
        <AppText variant="bodyStrong" color={danger ? palette.dangerText : palette.text}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
      {chevron ? (
        <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
      ) : null}
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
});
