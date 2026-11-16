import { useWindowDimensions } from 'react-native';

import { breakpoints, layout } from '@/constants/theme';

export type Breakpoint = 'compact' | 'medium' | 'wide';

/**
 * Layout sizes used by every screen.
 *
 * compact: phones (one column, full-width buttons)
 * medium:  tablets and small browser windows (one column, wider cards)
 * wide:    desktop windows (two columns, content capped for readability)
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const breakpoint: Breakpoint =
    width >= breakpoints.wide ? 'wide' : width >= breakpoints.medium ? 'medium' : 'compact';
  const isWide = breakpoint === 'wide';
  const isCompact = breakpoint === 'compact';

  const contentMaxWidth = isWide
    ? layout.wideMaxWidth
    : width >= breakpoints.medium
      ? layout.mediumMaxWidth
      : layout.maxWidth;

  return {
    width,
    height,
    breakpoint,
    isCompact,
    isMedium: breakpoint === 'medium',
    isWide,
    columns: isWide ? 2 : 1,
    contentMaxWidth,
    /** True when the viewport can fit two comfortable columns. */
    twoColumn: isWide,
  };
}
