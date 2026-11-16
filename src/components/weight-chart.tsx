import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { AppText } from '@/components/ui/app-text';
import { palette, spacing } from '@/constants/theme';

interface WeightChartProps {
  data: { date: string; weightKg: number }[];
  height?: number;
  color?: string;
}

export function WeightChart({ data, height = 150, color = palette.primaryAction }: WeightChartProps) {
  // Measure the actual card width so the chart also fits inside a desktop column.
  const [chartWidth, setChartWidth] = useState(0);

  if (data.length === 0) return null;

  const values = data.map((item) => item.weightKg);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = Math.max(rawMax - rawMin, 1);
  const min = rawMin - spread * 0.2;
  const max = rawMax + spread * 0.2;

  const paddingX = 8;
  const paddingY = 14;
  const innerWidth = Math.max(chartWidth - paddingX * 2, 0);
  const innerHeight = height - paddingY * 2;

  const points = data.map((item, index) => {
    const x =
      paddingX + (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
    const y = paddingY + (1 - (item.weightKg - min) / (max - min)) * innerHeight;
    return { x, y, ...item };
  });

  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <View
      style={{ gap: spacing.sm }}
      onLayout={(event) => setChartWidth(Math.round(event.nativeEvent.layout.width))}
      accessibilityLabel={`Weight chart, ${data.length} entries`}>
      {chartWidth > 40 ? (
        <Svg width={chartWidth} height={height}>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <Line
              key={ratio}
              x1={paddingX}
              x2={chartWidth - paddingX}
              y1={paddingY + innerHeight * ratio}
              y2={paddingY + innerHeight * ratio}
              stroke={palette.border}
              strokeDasharray="4 6"
              strokeWidth={1}
            />
          ))}
          <Path
            d={path}
            stroke={color}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point) => (
            <Circle
              key={point.date}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={palette.surface}
              stroke={color}
              strokeWidth={2}
            />
          ))}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="caption">{Math.round(min * 10) / 10} kg</AppText>
        <AppText variant="caption">{Math.round(max * 10) / 10} kg</AppText>
      </View>
    </View>
  );
}
