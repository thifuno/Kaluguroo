import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { AppText } from '@/components/ui/app-text';
import { palette } from '@/constants/theme';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
  label?: string;
  caption?: string;
}

export function ProgressRing({
  progress,
  size = 176,
  strokeWidth = 14,
  color = palette.primaryAction,
  trackColor = palette.primarySoft,
  children,
  label,
  caption,
}: ProgressRingProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const radiusValue = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const offset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[styles.overlay, styles.center]}>
        {children ?? (
          <>
            <AppText variant="title" align="center">
              {label}
            </AppText>
            {caption ? (
              <AppText variant="caption" align="center">
                {caption}
              </AppText>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
