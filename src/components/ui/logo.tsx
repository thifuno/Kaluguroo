import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, spacing } from '@/constants/theme';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkColor?: string;
  tagline?: string;
}

export function Logo({
  size = 64,
  showWordmark = false,
  wordmarkColor = palette.text,
  tagline,
}: LogoProps) {
  return (
    <View style={styles.row}>
      <LinearGradient
        colors={[palette.primary, '#FF9168']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.mark,
          { width: size, height: size, borderRadius: size * 0.32 },
        ]}>
        <Ionicons name="nutrition" size={size * 0.52} color={palette.white} />
      </LinearGradient>
      {showWordmark ? (
        <View style={styles.wordmark}>
          <AppText variant="heading" color={palette.text} style={[styles.name, { color: wordmarkColor }]}>
            Kaluguroo
          </AppText>
          {tagline ? <AppText variant="caption">{tagline}</AppText> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mark: { alignItems: 'center', justifyContent: 'center' },
  wordmark: { gap: 2 },
  name: { letterSpacing: -0.5 },
});
