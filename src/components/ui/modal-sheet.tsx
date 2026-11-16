import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { palette, radius, spacing } from '@/constants/theme';
import { useApp } from '@/store/app-provider';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  closeLabel?: string;
}

export function ModalSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  scroll = true,
  closeLabel,
}: ModalSheetProps) {
  const { t } = useApp();
  const insets = useSafeAreaInsets();
  const closeText = closeLabel ?? t('common.close');

  // react-native-web unmounts a modal only after its CSS exit animation ends.
  // If that event is throttled (background tab, reduced motion) the sheet would
  // stay on screen, so unmount it directly on web.
  if (Platform.OS === 'web' && !visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      // Slide animations on web can leave the sheet mid-frame when the browser
      // throttles animation frames (background tab), so appear instantly there.
      animationType={Platform.OS === 'web' ? 'none' : 'slide'}
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeText}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrapper}>
          <View
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
            testID="app-sheet">
            <View style={styles.handle} />
            {title ? (
              <View style={styles.header}>
                <View style={styles.headerText}>
                  <AppText variant="subheading">{title}</AppText>
                  {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={closeText}
                  hitSlop={4}
                  onPress={onClose}
                  style={styles.close}>
                  <Ionicons name="close" size={24} color={palette.textMuted} />
                </Pressable>
              </View>
            ) : null}

            {scroll ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.content}>
                {children}
              </ScrollView>
            ) : (
              <View style={styles.content}>{children}</View>
            )}

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: palette.overlay },
  sheetWrapper: { justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    backgroundColor: palette.background,
    borderTopLeftRadius: radius.xl + 6,
    borderTopRightRadius: radius.xl + 6,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    maxHeight: '92%',
    width: '100%',
    maxWidth: 640,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerText: { flex: 1, gap: 2 },
  close: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { gap: spacing.lg, paddingBottom: spacing.sm },
  footer: { paddingTop: spacing.md, gap: spacing.sm },
});
