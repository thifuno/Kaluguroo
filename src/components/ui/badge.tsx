import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, spacing } from '@/constants/theme';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

const tones: Record<Tone, { background: string; text: string }> = {
  primary: { background: palette.primarySoft, text: palette.primaryPressed },
  success: { background: palette.successSoft, text: palette.successText },
  warning: { background: palette.warningSoft, text: palette.warningText },
  danger: { background: palette.dangerSoft, text: palette.dangerText },
  neutral: { background: palette.surfaceMuted, text: palette.textMuted },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  return (
    <View style={[styles.base, { backgroundColor: tones[tone].background }]}>
      <AppText variant="caption" color={tones[tone].text} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: { fontWeight: '700' },
});
