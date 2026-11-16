import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { palette, radius, spacing } from '@/constants/theme';
import { AuthHeader } from '@/features/auth/auth-header';
import { authErrorKey } from '@/features/auth/auth-errors';
import { useApp } from '@/store/app-provider';
import type { TranslationKey } from '@/lib/i18n';

export default function LoginScreen() {
  const { t, signIn, signInWithGoogle, onboarded } = useApp();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setErrorKey(null);
    try {
      await signIn(email, password);
      router.replace(onboarded ? '/(tabs)' : '/onboarding');
    } catch (error) {
      setErrorKey(authErrorKey(error));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast(t(authErrorKey(error)), 'info');
    }
  };

  return (
    <Screen bottomInset={spacing.xxl} maxWidth={560}>
      <AuthHeader title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')} />

      <View style={styles.form}>
        <TextField
          label={t('auth.email')}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrorKey(null);
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          icon="mail-outline"
          returnKeyType="next"
        />
        <TextField
          label={t('auth.password')}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrorKey(null);
          }}
          placeholder="••••••••"
          secureTextEntry
          icon="lock-closed-outline"
          returnKeyType="go"
          onSubmitEditing={() => void submit()}
        />

        {errorKey ? (
          <View style={styles.error} accessibilityRole="alert">
            <Ionicons name="alert-circle-outline" size={21} color={palette.dangerText} />
            <AppText variant="body" color={palette.dangerText} style={styles.errorText}>
              {t(errorKey)}
            </AppText>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('auth.forgotPassword')}
          onPress={() => router.push('/forgot-password')}
          style={({ pressed }) => [styles.forgot, pressed && { opacity: 0.7 }]}>
          <AppText variant="label" color={palette.primaryPressed}>
            {t('auth.forgotPassword')}
          </AppText>
        </Pressable>

        <Button label={t('auth.signIn')} onPress={() => void submit()} loading={loading} size="lg" />
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <AppText variant="caption">{t('auth.or')}</AppText>
        <View style={styles.line} />
      </View>

      <Button
        label={t('auth.google')}
        onPress={() => void google()}
        variant="secondary"
        icon="logo-google"
      />

      <View style={styles.footer}>
        <AppText variant="body">{t('auth.noAccount')}</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('auth.signUp')}
          onPress={() => router.push('/signup')}
          style={({ pressed }) => [styles.footerLink, pressed && { opacity: 0.7 }]}>
          <AppText variant="bodyStrong" color={palette.primaryPressed}>
            {t('auth.signUp')}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg, marginTop: spacing.xxl },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: palette.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { flex: 1 },
  forgot: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xl,
  },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: palette.borderStrong },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  footerLink: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
});
