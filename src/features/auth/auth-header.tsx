import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, spacing } from '@/constants/theme';
import { useApp } from '@/store/app-provider';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function AuthHeader({ title, subtitle, onBack }: AuthHeaderProps) {
  const { t } = useApp();

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        hitSlop={4}
        onPress={onBack ?? (() => router.back())}
        style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}>
        <Ionicons name="chevron-back" size={26} color={palette.text} />
      </Pressable>
      <View style={styles.text}>
        <AppText variant="title">{title}</AppText>
        {subtitle ? (
          <AppText variant="body" color={palette.textMuted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingTop: spacing.sm },
  back: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { gap: spacing.xs + 2 },
});
