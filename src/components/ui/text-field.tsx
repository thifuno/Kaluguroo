import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, spacing } from '@/constants/theme';
import { useApp } from '@/store/app-provider';
import { useTextScale } from '@/store/text-scale-provider';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  suffix?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function TextField({
  label,
  error,
  hint,
  icon,
  suffix,
  secureTextEntry,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const { t } = useApp();
  const { scale } = useTextScale();

  const borderColor = error
    ? palette.danger
    : focused
      ? palette.primaryAction
      : palette.borderStrong;
  const inputFontSize = Math.round(16 * Math.min(scale, 1.3));
  const minHeight = Math.round(56 * Math.min(scale, 1.2));

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText variant="label" color={palette.text} style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          {
            minHeight,
            borderColor,
            backgroundColor: palette.surface,
          },
          focused && styles.focused,
        ]}>
        {icon ? <Ionicons name={icon} size={21} color={palette.textMuted} /> : null}
        <TextInput
          {...rest}
          accessibilityLabel={rest.accessibilityLabel ?? label ?? rest.placeholder}
          secureTextEntry={hidden}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          placeholderTextColor={palette.textSubtle}
          style={[styles.input, { fontSize: inputFontSize }, style]}
        />
        {suffix ? (
          <AppText variant="body" color={palette.textMuted}>
            {suffix}
          </AppText>
        ) : null}
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hidden ? t('common.showPassword') : t('common.hidePassword')
            }
            hitSlop={4}
            onPress={() => setHidden((value) => !value)}
            style={styles.eyeButton}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={palette.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <AppText variant="caption" color={palette.dangerText}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption">{hint}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs + 2 },
  label: { marginLeft: 2 },
  inputWrapper: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  focused: {
    borderWidth: 2,
    shadowColor: palette.primaryAction,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    color: palette.text,
  },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
});
