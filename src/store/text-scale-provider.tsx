import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react';

import { textScales } from '@/constants/theme';
import { useApp } from '@/store/app-provider';
import type { TextSize } from '@/types/models';

interface TextScaleValue {
  textSize: TextSize;
  scale: number;
  setTextSize: (size: TextSize) => void;
}

const fallback: TextScaleValue = {
  textSize: 'normal',
  scale: 1,
  setTextSize: () => undefined,
};

const TextScaleContext = createContext<TextScaleValue>(fallback);

/**
 * Applies the text-size preference to every AppText and form control.
 * Lives inside AppProvider so the preference is stored with the rest of the app state.
 */
export function TextScaleProvider({ children }: PropsWithChildren) {
  const { preferences, updatePreferences } = useApp();
  const textSize = preferences.textSize ?? 'normal';

  const setTextSize = useCallback(
    (size: TextSize) => updatePreferences({ textSize: size }),
    [updatePreferences],
  );

  const value = useMemo<TextScaleValue>(
    () => ({ textSize, scale: textScales[textSize] ?? 1, setTextSize }),
    [textSize, setTextSize],
  );

  return <TextScaleContext.Provider value={value}>{children}</TextScaleContext.Provider>;
}

export function useTextScale(): TextScaleValue {
  return useContext(TextScaleContext);
}
