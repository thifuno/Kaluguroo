import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Logo } from '@/components/ui/logo';
import { palette, spacing } from '@/constants/theme';

export function SplashView({ tagline }: { tagline: string }) {
  const pulse = useSharedValue(0);
  const intro = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, true);
    intro.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [intro, pulse]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.94 + pulse.value * 0.06 }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: intro.value,
    transform: [{ translateY: (1 - intro.value) * 12 }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <Animated.View style={logoStyle}>
        <Logo size={92} />
      </Animated.View>

      <Animated.View style={[styles.textBlock, textStyle]}>
        <AppText variant="display" align="center" color={palette.text}>
          Kaluguroo
        </AppText>
        <AppText variant="body" align="center" color={palette.textMuted}>
          {tagline}
        </AppText>
      </Animated.View>

      <View style={styles.loader}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={[styles.dot, index === 1 && styles.dotStrong]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  blobTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: palette.primarySoft,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -140,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: palette.surfaceMuted,
  },
  textBlock: { gap: spacing.sm, alignItems: 'center', paddingHorizontal: spacing.xxl },
  loader: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.primaryBorder,
  },
  dotStrong: { backgroundColor: palette.primary, width: 18 },
});
