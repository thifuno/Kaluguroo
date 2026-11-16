import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radius, shadowSoft, spacing } from '@/constants/theme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  tone?: 'surface' | 'muted' | 'primary' | 'transparent';
  accessibilityLabel?: string;
}

const tones = {
  surface: palette.surface,
  muted: palette.surfaceMuted,
  primary: palette.primarySoft,
  transparent: 'transparent',
};

export function Card({
  children,
  onPress,
  style,
  padded = true,
  tone = 'surface',
  accessibilityLabel,
}: CardProps) {
  const content = (
    <View
      style={[
        styles.base,
        {
          backgroundColor: tones[tone],
          padding: padded ? spacing.lg : 0,
          borderColor: tone === 'surface' ? palette.border : 'transparent',
        },
        style,
      ]}>
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    borderWidth: 1,
    ...shadowSoft,
  },
});
