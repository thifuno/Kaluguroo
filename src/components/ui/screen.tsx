import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { layout, palette } from '@/constants/theme';
import { useResponsive } from '@/lib/responsive';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bottomInset?: number;
  backgroundColor?: string;
  footer?: ReactNode;
  keyboardAvoiding?: boolean;
  /** Override the responsive content width (forms and single-task screens). */
  maxWidth?: number;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
  contentContainerStyle,
  bottomInset = layout.tabBarHeight + 48,
  backgroundColor = palette.background,
  footer,
  keyboardAvoiding = true,
  maxWidth,
}: ScreenProps) {
  const { contentMaxWidth } = useResponsive();
  const width = maxWidth ?? contentMaxWidth;

  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={[styles.centered, { maxWidth: width }]}
      contentContainerStyle={[
        styles.scrollContent,
        padded ? styles.padded : null,
        { paddingBottom: bottomInset + 24 },
        contentContainerStyle,
      ]}>
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        styles.centered,
        padded ? styles.padded : null,
        { maxWidth: width },
        contentContainerStyle,
      ]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }, style]} edges={['top']}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {content}
          {footer}
        </KeyboardAvoidingView>
      ) : (
        <>
          {content}
          {footer}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  centered: { width: '100%', alignSelf: 'center' },
  padded: { paddingHorizontal: layout.screenPadding },
  scrollContent: { flexGrow: 1 },
});
