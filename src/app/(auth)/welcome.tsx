import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Screen } from '@/components/ui/screen';
import { palette, radius, spacing } from '@/constants/theme';
import { useResponsive } from '@/lib/responsive';
import { useApp } from '@/store/app-provider';

export default function WelcomeScreen() {
  const { t, signInDemo } = useApp();
  const { isWide } = useResponsive();

  const features: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { icon: 'scan-outline', label: t('auth.featureScan') },
    { icon: 'sparkles-outline', label: t('auth.featurePlan') },
    { icon: 'trending-up-outline', label: t('auth.featureTrack') },
  ];

  return (
    <Screen bottomInset={spacing.xl} padded={false} contentContainerStyle={styles.content}>
      <View style={[styles.inner, isWide && styles.innerWide]}>
        <LinearGradient
          colors={[palette.primarySoft, palette.background]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.hero, isWide && styles.heroWide]}>
          <View style={styles.heroBlob} />
          <Logo size={88} />
          <AppText variant="caption" color={palette.primaryPressed} style={styles.logoCaption}>
            {t('app.tagline')}
          </AppText>
        </LinearGradient>

        <View style={[styles.body, isWide && styles.bodyWide]}>
          <View style={styles.heading}>
            <AppText variant="display" align="center">
              {t('auth.welcomeTitle')}
            </AppText>
            <AppText variant="body" color={palette.textMuted} align="center">
              {t('auth.welcomeSubtitle')}
            </AppText>
          </View>

          <View style={styles.features}>
            {features.map((feature) => (
              <View key={feature.label} style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={22} color={palette.primaryPressed} />
                </View>
                <AppText variant="body" style={styles.featureLabel}>
                  {feature.label}
                </AppText>
                <Ionicons name="checkmark-circle" size={22} color={palette.successText} />
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              label={t('auth.getStarted')}
              onPress={() => router.push('/signup')}
              size="lg"
              icon="arrow-forward"
              iconPosition="right"
            />
            <Button
              label={t('auth.haveAccount')}
              onPress={() => router.push('/login')}
              variant="secondary"
              icon="log-in-outline"
            />
            <Button
              label={t('auth.demoLogin')}
              onPress={() => {
                void signInDemo().then(() => router.replace('/(tabs)'));
              }}
              variant="ghost"
              size="sm"
              icon="flask-outline"
            />
            <AppText variant="caption" align="center">
              {t('auth.terms')}
            </AppText>
            <AppText variant="caption" align="center">
              {t('onboarding.privacyNote')}
            </AppText>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'space-between' },
  inner: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  innerWide: {
    maxWidth: 1040,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  hero: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    borderRadius: radius.xl + 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    overflow: 'hidden',
    gap: spacing.xs,
  },
  heroWide: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 0,
    paddingVertical: 0,
    alignSelf: 'stretch',
  },
  heroBlob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: palette.surface,
    opacity: 0.55,
    top: -60,
    right: -60,
  },
  logoCaption: { marginTop: spacing.sm, textAlign: 'center' },
  body: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
    paddingTop: spacing.xl,
  },
  bodyWide: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    justifyContent: 'center',
  },
  heading: { gap: spacing.sm },
  features: { gap: spacing.sm },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 60,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: { flex: 1 },
  actions: { gap: spacing.md, paddingTop: spacing.xs },
});
