import type { ComponentProps, ReactNode } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, fontSize, palette } from '@/constants/theme';
import { useTextScale } from '@/store/text-scale-provider';

export type AppTextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'mono';

type Variant = AppTextVariant;

export const variantStyles: Record<Variant, TextStyle> = {
  display: { fontSize: fontSize.display, lineHeight: 48, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: fontSize.xxxl, lineHeight: 42, fontWeight: '800', letterSpacing: -0.4 },
  heading: { fontSize: fontSize.xxl, lineHeight: 34, fontWeight: '700', letterSpacing: -0.3 },
  subheading: { fontSize: fontSize.xl, lineHeight: 29, fontWeight: '700' },
  body: { fontSize: fontSize.md, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: fontSize.md, lineHeight: 24, fontWeight: '700' },
  caption: { fontSize: fontSize.sm, lineHeight: 21, fontWeight: '400', color: palette.textMuted },
  label: { fontSize: fontSize.sm, lineHeight: 20, fontWeight: '700', letterSpacing: 0.2 },
  mono: { fontSize: fontSize.sm, lineHeight: 20, fontWeight: '600', fontVariant: ['tabular-nums'] },
};

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children?: ReactNode;
  style?: ComponentProps<typeof Text>['style'];
}

export function AppText({
  variant = 'body',
  color = palette.text,
  align,
  style,
  children,
  ...rest
}: AppTextProps) {
  const { scale } = useTextScale();
  const base = variantStyles[variant];
  const scaled =
    scale === 1
      ? base
      : {
          ...base,
          fontSize: base.fontSize ? Math.round(base.fontSize * scale) : base.fontSize,
          lineHeight: base.lineHeight ? Math.round(base.lineHeight * scale) : base.lineHeight,
        };

  return (
    <Text
      {...rest}
      style={[
        { fontFamily: Fonts?.sans, color },
        scaled,
        align ? { textAlign: align } : null,
        style,
      ]}>
      {children}
    </Text>
  );
}
