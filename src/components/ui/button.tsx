import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, spacing } from '@/constants/theme';
import { useTextScale } from '@/store/text-scale-provider';

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  rightSlot?: ReactNode;
  testID?: string;
  accessibilityHint?: string;
}

const heights: Record<Size, number> = { sm: 44, md: 52, lg: 60 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  rightSlot,
  testID,
  accessibilityHint,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const { scale } = useTextScale();
  const minHeight = Math.round(heights[size] * Math.min(scale, 1.2));

  const colors = {
    primary: {
      background: palette.primaryAction,
      pressed: palette.primaryActionPressed,
      border: palette.primaryAction,
      text: palette.white,
    },
    secondary: {
      background: palette.surface,
      pressed: palette.surfaceMuted,
      border: palette.borderStrong,
      text: palette.text,
    },
    soft: {
      background: palette.primarySoft,
      pressed: '#FFE0D2',
      border: palette.primaryBorder,
      text: palette.primaryPressed,
    },
    ghost: {
      background: 'transparent',
      pressed: palette.surfaceMuted,
      border: 'transparent',
      text: palette.primaryPressed,
    },
    danger: {
      background: palette.dangerSoft,
      pressed: '#FBDDDD',
      border: palette.dangerSoft,
      text: palette.dangerText,
    },
  }[variant];

  const handlePress = () => {
    if (isDisabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress?.();
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      aria-busy={loading}
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight,
          backgroundColor: pressed && !isDisabled ? colors.pressed : colors.background,
          borderColor: colors.border,
          opacity: isDisabled ? 0.55 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.lg,
          paddingVertical: spacing.sm,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' ? (
            <Ionicons name={icon} size={size === 'sm' ? 18 : 21} color={colors.text} />
          ) : null}
          <AppText
            variant={size === 'sm' ? 'label' : 'bodyStrong'}
            color={colors.text}
            style={styles.label}>
            {label}
          </AppText>
          {icon && iconPosition === 'right' ? (
            <Ionicons name={icon} size={size === 'sm' ? 18 : 21} color={colors.text} />
          ) : null}
          {rightSlot}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  label: { flexShrink: 1, textAlign: 'center' },
});
