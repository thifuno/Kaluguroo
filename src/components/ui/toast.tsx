import { Ionicons } from '@expo/vector-icons';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, shadow, spacing } from '@/constants/theme';

type ToastTone = 'success' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState | null>(null);
  // Animated values are stable instances; state keeps them out of render-time ref reads.
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(16));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ id: Date.now(), message, tone });
      opacity.setValue(0);
      translateY.setValue(16);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
      timer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 12, duration: 200, useNativeDriver: true }),
        ]).start(() => setToast(null));
      }, 2300);
    },
    [opacity, translateY],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const toneStyles = {
    success: { icon: 'checkmark-circle' as const, color: palette.success },
    error: { icon: 'alert-circle' as const, color: palette.danger },
    info: { icon: 'information-circle' as const, color: palette.primary },
  };

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[
            styles.toast,
            {
              bottom: insets.bottom + 96,
              opacity,
              transform: [{ translateY }],
            },
          ]}>
          <View style={styles.inner}>
            <Ionicons name={toneStyles[toast.tone].icon} size={20} color={toneStyles[toast.tone].color} />
            <AppText variant="bodyStrong" style={styles.text} numberOfLines={2}>
              {toast.message}
            </AppText>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside <ToastProvider>');
  return show;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    alignItems: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    maxWidth: 420,
    ...shadow,
  },
  text: { flexShrink: 1 },
});
