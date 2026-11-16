import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/app-text';
import { palette, radius, spacing } from '@/constants/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({
  icon = 'nutrition-outline',
  title,
  body,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color={palette.primaryPressed} />
      </View>
      <AppText variant="bodyStrong" align="center">
        {title}
      </AppText>
      {body ? (
        <AppText variant="caption" align="center" style={styles.body}>
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="soft"
          size="md"
          fullWidth={false}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title, body, onRetry, retryLabel }: ErrorStateProps) {
  return (
    <View style={[styles.container, styles.errorContainer]}>
      <View style={[styles.iconCircle, styles.errorIcon]}>
        <Ionicons name="alert-circle-outline" size={28} color={palette.dangerText} />
      </View>
      <AppText variant="bodyStrong" align="center">
        {title ?? 'Something went wrong'}
      </AppText>
      {body ? (
        <AppText variant="caption" align="center" style={styles.body}>
          {body}
        </AppText>
      ) : null}
      {onRetry ? (
        <Button
          label={retryLabel ?? 'Try again'}
          onPress={onRetry}
          variant="soft"
          size="md"
          fullWidth={false}
          icon="refresh"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={palette.primaryAction} size="large" />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  compact: { paddingVertical: spacing.lg },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  errorIcon: { backgroundColor: palette.dangerSoft },
  errorContainer: {
    backgroundColor: palette.dangerSoft,
    borderRadius: radius.lg,
    marginVertical: spacing.md,
  },
  body: { maxWidth: 340 },
  action: { marginTop: spacing.sm },
});
