import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { palette, radius, spacing } from '@/constants/theme';
import { AuthHeader } from '@/features/auth/auth-header';
import { isValidEmail } from '@/services/auth/mock-auth';
import { useApp } from '@/store/app-provider';

export default function ForgotPasswordScreen() {
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!isValidEmail(email.trim())) {
      setError(t('auth.invalidEmail'));
      return;
    }
    setError(null);
    setSent(true);
  };

  if (sent) {
    return (
      <Screen bottomInset={spacing.xxl} maxWidth={560}>
        <AuthHeader title={t('auth.resetSentTitle')} />
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-unread-outline" size={32} color={palette.primaryPressed} />
          </View>
          <AppText variant="body" align="center">
            {t('auth.resetSentBody', { email: email.trim().toLowerCase() })}
          </AppText>
          <AppText variant="caption" align="center">
            {t('auth.resetNotConfigured')}
          </AppText>
        </View>
        <Button
          label={t('auth.signIn')}
          onPress={() => router.replace('/login')}
          icon="log-in-outline"
          style={styles.action}
        />
      </Screen>
    );
  }

  return (
    <Screen bottomInset={spacing.xxl} maxWidth={560}>
      <AuthHeader title={t('auth.forgotPassword')} subtitle={t('auth.resetHelp')} />
      <View style={styles.form}>
        <TextField
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          icon="mail-outline"
          error={error}
          onSubmitEditing={submit}
        />
        <Button label={t('auth.sendReset')} onPress={submit} size="lg" />
        <Button label={t('common.back')} onPress={() => router.back()} variant="ghost" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg, marginTop: spacing.xxl },
  successCard: {
    marginTop: spacing.xxl,
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: { marginTop: spacing.xl },
});
