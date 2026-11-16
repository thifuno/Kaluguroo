import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { palette, radius, spacing } from '@/constants/theme';
import { AuthHeader } from '@/features/auth/auth-header';
import { authErrorKey } from '@/features/auth/auth-errors';
import { isValidEmail } from '@/services/auth/mock-auth';
import { useApp } from '@/store/app-provider';
import type { TranslationKey } from '@/lib/i18n';

export default function SignupScreen() {
  const { t, signUp } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [loading, setLoading] = useState(false);

  const clearError = () => setErrorKey(null);

  const submit = async () => {
    setErrorKey(null);
    if (!name.trim()) {
      setErrorKey('auth.nameRequired');
      return;
    }
    if (!isValidEmail(email.trim())) {
      setErrorKey('auth.invalidEmail');
      return;
    }
    if (password.length < 8) {
      setErrorKey('auth.shortPassword');
      return;
    }
    if (password !== confirm) {
      setErrorKey('auth.passwordMismatch');
      return;
    }

    setLoading(true);
    try {
      await signUp({ name, email, password });
      router.replace({ pathname: '/onboarding', params: { name: name.trim() } });
    } catch (error) {
      setErrorKey(authErrorKey(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen bottomInset={spacing.xxl} maxWidth={560}>
      <AuthHeader title={t('auth.signupTitle')} subtitle={t('auth.signupSubtitle')} />

      <View style={styles.form}>
        <TextField
          label={t('auth.displayName')}
          value={name}
          onChangeText={(value) => {
            setName(value);
            clearError();
          }}
          placeholder="Kaluguroo"
          autoCapitalize="words"
          autoComplete="name"
          icon="person-outline"
          returnKeyType="next"
        />
        <TextField
          label={t('auth.email')}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            clearError();
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
            clearError();
          }}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="new-password"
          icon="lock-closed-outline"
          hint={t('auth.shortPassword')}
          returnKeyType="next"
        />
        <TextField
          label={t('auth.confirmPassword')}
          value={confirm}
          onChangeText={(value) => {
            setConfirm(value);
            clearError();
          }}
          placeholder="••••••••"
          secureTextEntry
          icon="shield-checkmark-outline"
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

        <Button
          label={t('auth.signUp')}
          onPress={() => void submit()}
          loading={loading}
          size="lg"
          icon="checkmark"
        />
        <AppText variant="caption" align="center">
          {t('onboarding.privacyNote')}
        </AppText>
        <AppText variant="caption" align="center">
          {t('auth.terms')}
        </AppText>
      </View>

      <View style={styles.footer}>
        <AppText variant="body">{t('auth.alreadyAccount')}</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('auth.signIn')}
          onPress={() => router.replace('/login')}
          style={({ pressed }) => [styles.footerLink, pressed && { opacity: 0.7 }]}>
          <AppText variant="bodyStrong" color={palette.primaryPressed}>
            {t('auth.signIn')}
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
