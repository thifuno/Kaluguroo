import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { HelpButton, type HelpTopic } from '@/components/ui/help-sheet';
import { palette, radius, spacing } from '@/constants/theme';
import { useApp } from '@/store/app-provider';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Small line above the title, e.g. today's date. */
  eyebrow?: string;
  helpTopic?: HelpTopic;
  right?: ReactNode;
  onClose?: () => void;
}

/**
 * Shared page heading: a clear title, a one-line explanation, a visible help
 * button and an optional close button. Every main screen uses this so the
 * "what is this page / how do I use it" answer is always in the same place.
 */
export function ScreenHeader({
  title,
  subtitle,
  eyebrow,
  helpTopic,
  right,
  onClose,
}: ScreenHeaderProps) {
  const { t } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.text}>
        {eyebrow ? <AppText variant="caption">{eyebrow}</AppText> : null}
        <AppText variant="heading">{title}</AppText>
        {subtitle ? (
          <AppText variant="body" color={palette.textMuted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={styles.actions}>
        {helpTopic ? <HelpButton topic={helpTopic} /> : null}
        {right}
        {onClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={onClose}
            style={({ pressed }) => [styles.close, pressed && { opacity: 0.7 }]}>
            <Ionicons name="close" size={24} color={palette.text} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  text: { flex: 1, gap: 2 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
