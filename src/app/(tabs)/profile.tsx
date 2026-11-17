import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeader } from '@/components/ui/section-header';
import { Segmented } from '@/components/ui/segmented';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { palette, radius, spacing } from '@/constants/theme';
import { confirmDestructive } from '@/lib/confirm';
import { formatDateKey } from '@/lib/date';
import { useResponsive } from '@/lib/responsive';
import { isAiConfigured, testAiConnection } from '@/services/ai/food-analysis';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { useApp } from '@/store/app-provider';
import { useTextScale } from '@/store/text-scale-provider';
import type { AiProvider, TextSize } from '@/types/models';

export default function ProfileScreen() {
  const {
    t,
    language,
    profile,
    plan,
    session,
    preferences,
    demoDataLoaded,
    setLanguage,
    updatePreferences,
    signOut,
    loadDemoData,
    clearMyData,
    deleteAccount,
  } = useApp();
  const toast = useToast();
  const { isWide } = useResponsive();
  const { textSize, setTextSize } = useTextScale();

  const name = profile?.displayName || session?.email.split('@')[0] || t('profile.guest');
  const initial = name.trim().charAt(0).toUpperCase() || 'K';
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const aiReady = isAiConfigured(preferences.ai);

  // `null` means "show the saved value", so hydration and saves need no effect.
  const [aiProviderDraft, setAiProviderDraft] = useState<AiProvider | null>(null);
  const [aiKeyDraft, setAiKeyDraft] = useState<string | null>(null);
  const aiProvider = aiProviderDraft ?? preferences.ai.provider;
  const aiKey = aiKeyDraft ?? preferences.ai.apiKey;

  const saveAi = () => {
    const apiKey = aiKey.trim();
    updatePreferences({ ai: { provider: aiProvider, apiKey } });
    setAiProviderDraft(null);
    setAiKeyDraft(null);
    toast(apiKey ? t('profile.aiSaved') : t('profile.aiCleared'), 'success');
  };

  const clearAi = () => {
    setAiKeyDraft(null);
    updatePreferences({ ai: { provider: aiProvider, apiKey: '' } });
    toast(t('profile.aiCleared'), 'info');
  };

  const keyUrl =
    aiProvider === 'gemini'
      ? 'https://aistudio.google.com/app/apikey'
      : 'https://platform.openai.com/api-keys';

  const [aiTest, setAiTest] = useState<
    { status: 'ok' } | { status: 'error'; message: string } | null
  >(null);
  const [aiTesting, setAiTesting] = useState(false);

  const runAiTest = () => {
    const apiKey = aiKey.trim();
    if (!apiKey) return;
    setAiTesting(true);
    setAiTest(null);
    void testAiConnection({ provider: aiProvider, apiKey })
      .then((result) => {
        setAiTest(result.status === 'ok' ? { status: 'ok' } : { status: 'error', message: result.message });
      })
      .finally(() => setAiTesting(false));
  };

  const confirmSignOut = () => {
    void confirmDestructive({
      title: t('auth.signOutTitle'),
      message: t('auth.signOutBody'),
      confirmLabel: t('auth.signOut'),
      cancelLabel: t('common.cancel'),
    }).then((confirmed) => {
      if (!confirmed) return;
      void signOut();
      router.replace('/(auth)/welcome');
    });
  };

  const confirmDelete = () => {
    void confirmDestructive({
      title: t('profile.deleteAccount'),
      message: t('profile.deleteAccountBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    }).then((confirmed) => {
      if (!confirmed) return;
      void deleteAccount();
      router.replace('/(auth)/welcome');
    });
  };

  const changeTextSize = (value: TextSize) => {
    setTextSize(value);
    toast(t('profile.settingsSaved'), 'success');
  };

  const profileColumn = (
    <>
      <Card style={styles.accountCard}>
        <View style={styles.avatar}>
          <AppText variant="title" color={palette.white}>
            {initial}
          </AppText>
        </View>
        <View style={styles.accountText}>
          <View style={styles.nameRow}>
            <AppText variant="subheading" numberOfLines={1} style={styles.name}>
              {name}
            </AppText>
            {demoDataLoaded ? <Badge label={t('common.demo')} tone="warning" /> : null}
          </View>
          <AppText variant="caption" numberOfLines={1}>
            {session?.email ?? t('profile.guest')}
          </AppText>
          {session ? (
            <AppText variant="caption">
              {t('profile.memberSince')} {formatDateKey(session.createdAt.slice(0, 10), language)}
            </AppText>
          ) : null}
        </View>
      </Card>

      <Card style={styles.planCard}>
        <View style={styles.planItem}>
          <AppText variant="caption">{t('health.calorieTarget')}</AppText>
          <AppText variant="subheading">{plan?.calorieTarget ?? '-'}</AppText>
          <AppText variant="caption">{t('common.kcal')}</AppText>
        </View>
        <View style={styles.planDivider} />
        <View style={styles.planItem}>
          <AppText variant="caption">{t('health.bmi')}</AppText>
          <AppText variant="subheading">{plan ? plan.bmi.toFixed(1) : '-'}</AppText>
          <AppText variant="caption">{plan ? t(`onboarding.bmi.${plan.bmiCategory}`) : '-'}</AppText>
        </View>
        <View style={styles.planDivider} />
        <View style={styles.planItem}>
          <AppText variant="caption">{t('profile.healthGoals')}</AppText>
          <AppText variant="subheading">{profile ? profile.targetWeightKg.toFixed(1) : '-'}</AppText>
          <AppText variant="caption">{t('common.kg')}</AppText>
        </View>
      </Card>

      <Button
        label={t('profile.editProfile')}
        onPress={() => router.push('/edit-profile')}
        icon="create-outline"
        variant="soft"
        style={styles.editButton}
      />

      <SectionHeader title={t('profile.textSize')} />
      <Card style={styles.textSizeCard}>
        <AppText variant="body" color={palette.textMuted}>
          {t('profile.textSizeDesc')}
        </AppText>
        <Segmented
          value={textSize}
          onChange={changeTextSize}
          options={[
            { value: 'normal', label: t('textSize.normal') },
            { value: 'large', label: t('textSize.large') },
            { value: 'xlarge', label: t('textSize.xlarge') },
          ]}
        />
        <View style={styles.previewRow}>
          <Ionicons name="eye-outline" size={20} color={palette.textMuted} />
          <AppText variant="body" style={styles.previewText}>
            {t('profile.textSizeDesc')}
          </AppText>
        </View>
      </Card>

      <SectionHeader title={t('profile.language')} />
      <Card>
        <Segmented
          value={language}
          onChange={(value) => {
            setLanguage(value);
            toast(t('profile.settingsSaved'), 'success');
          }}
          options={[
            { value: 'th', label: t('profile.thai') },
            { value: 'en', label: t('profile.english') },
          ]}
        />
      </Card>
    </>
  );

  const settingsColumn = (
    <>
      <SectionHeader title={t('profile.aiSection')} />
      <Card style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <View style={styles.aiHeaderText}>
            <AppText variant="bodyStrong">{t('profile.aiTitle')}</AppText>
            <AppText variant="caption">{t('profile.aiDesc')}</AppText>
          </View>
          <Badge
            label={aiReady ? t('profile.configured') : t('profile.notConfigured')}
            tone={aiReady ? 'success' : 'warning'}
          />
        </View>

        <Segmented
          value={aiProvider}
          onChange={setAiProviderDraft}
          options={[
            { value: 'gemini', label: t('profile.aiProviderGemini') },
            { value: 'openai', label: t('profile.aiProviderOpenai') },
          ]}
        />

        <TextField
          label={t('profile.aiApiKey')}
          value={aiKey}
          onChangeText={setAiKeyDraft}
          placeholder={aiProvider === 'gemini' ? 'AIza...' : 'sk-...'}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          hint={t('profile.aiApiKeyHint')}
        />

        <View style={styles.aiActions}>
          <Button
            label={t('profile.aiSave')}
            onPress={saveAi}
            icon="checkmark-circle-outline"
            style={styles.flexButton}
          />
          {preferences.ai.apiKey ? (
            <Button
              label={t('profile.aiClear')}
              onPress={clearAi}
              variant="secondary"
              icon="trash-outline"
              style={styles.flexButton}
            />
          ) : null}
        </View>

        <Button
          label={aiTesting ? t('profile.aiTesting') : t('profile.aiTest')}
          onPress={runAiTest}
          variant="secondary"
          icon="pulse-outline"
          loading={aiTesting}
          disabled={!aiKey.trim() || aiTesting}
        />

        {aiTest?.status === 'ok' ? (
          <View style={styles.aiTestRow}>
            <Ionicons name="checkmark-circle" size={18} color={palette.successText} />
            <AppText variant="caption" color={palette.successText} style={styles.aiLinkText}>
              {t('profile.aiTestOk')}
            </AppText>
          </View>
        ) : null}

        {aiTest?.status === 'error' ? (
          <View style={styles.aiTestBox}>
            <View style={styles.aiTestRow}>
              <Ionicons name="alert-circle" size={18} color={palette.dangerText} />
              <AppText variant="caption" color={palette.dangerText} style={styles.aiLinkText}>
                {t('profile.aiTestFail')}
              </AppText>
            </View>
            <AppText variant="caption" color={palette.textMuted}>
              {aiTest.message}
            </AppText>
            <AppText variant="caption" color={palette.textMuted}>
              {t('profile.aiTestHelp')}
            </AppText>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="link"
          accessibilityLabel={
            aiProvider === 'gemini'
              ? t('profile.aiGetKeyGemini')
              : t('profile.aiGetKeyOpenai')
          }
          onPress={() => void Linking.openURL(keyUrl)}
          style={({ pressed }) => [styles.aiLink, pressed && { opacity: 0.7 }]}>
          <Ionicons name="open-outline" size={16} color={palette.primaryPressed} />
          <AppText variant="caption" color={palette.primaryPressed} style={styles.aiLinkText}>
            {aiProvider === 'gemini'
              ? t('profile.aiGetKeyGemini')
              : t('profile.aiGetKeyOpenai')}
          </AppText>
        </Pressable>

        <AppText variant="caption">{t('profile.aiPrivacy')}</AppText>
      </Card>

      <SectionHeader title={t('profile.notifications')} />
      <Card>
        <ToggleRow
          icon="restaurant-outline"
          title={t('profile.notifMeals')}
          subtitle={t('profile.notifMealsDesc')}
          value={preferences.notifications.meals}
          onChange={(value) =>
            updatePreferences({ notifications: { ...preferences.notifications, meals: value } })
          }
        />
        <ToggleRow
          icon="calendar-outline"
          title={t('profile.notifWeekly')}
          subtitle={t('profile.notifWeeklyDesc')}
          value={preferences.notifications.weekly}
          onChange={(value) =>
            updatePreferences({ notifications: { ...preferences.notifications, weekly: value } })
          }
        />
        <ToggleRow
          icon="water-outline"
          title={t('profile.notifWater')}
          subtitle={t('profile.notifWaterDesc')}
          value={preferences.notifications.water}
          onChange={(value) =>
            updatePreferences({ notifications: { ...preferences.notifications, water: value } })
          }
          last
        />
      </Card>

      <SectionHeader title={t('profile.privacy')} />
      <Card>
        <ToggleRow
          icon="bar-chart-outline"
          title={t('profile.analytics')}
          subtitle={t('profile.analyticsDesc')}
          value={preferences.privacy.analytics}
          onChange={(value) =>
            updatePreferences({ privacy: { ...preferences.privacy, analytics: value } })
          }
        />
        <ToggleRow
          icon="shield-checkmark-outline"
          title={t('profile.shareHealth')}
          subtitle={t('profile.shareHealthDesc')}
          value={preferences.privacy.shareHealthData}
          onChange={(value) =>
            updatePreferences({ privacy: { ...preferences.privacy, shareHealthData: value } })
          }
          last
        />
      </Card>

      <SectionHeader title={t('profile.about')} />
      <Card padded={false} style={styles.aboutCard}>
        <View style={styles.aboutInner}>
          <ListRow
            icon="sparkles-outline"
            title={t('profile.aiStatus')}
            subtitle={
              aiReady
                ? preferences.ai.provider === 'gemini'
                  ? t('profile.aiProviderGemini')
                  : t('profile.aiProviderOpenai')
                : t('scan.notConnectedTitle')
            }
            right={
              <Badge
                label={aiReady ? t('profile.configured') : t('profile.notConfigured')}
                tone={aiReady ? 'success' : 'warning'}
              />
            }
          />
          <ListRow
            icon="cloud-outline"
            title={t('profile.supabaseStatus')}
            subtitle={isSupabaseConfigured ? 'Supabase' : 'Local storage'}
            right={
              <Badge
                label={isSupabaseConfigured ? t('profile.configured') : t('profile.notConfigured')}
                tone={isSupabaseConfigured ? 'success' : 'neutral'}
              />
            }
            showDivider
          />
          <ListRow
            icon="phone-portrait-outline"
            title={t('profile.version')}
            subtitle={`Kaluguroo ${version}`}
            right={<Badge label={version} tone="neutral" />}
            showDivider
          />
          <ListRow
            icon="document-text-outline"
            title={t('profile.terms')}
            chevron
            onPress={() => toast(t('profile.terms'), 'info')}
          />
        </View>
      </Card>

      {__DEV__ ? (
        <>
          <SectionHeader title={t('profile.demoData')} />
          <Card style={styles.devCard}>
            <AppText variant="caption">{t('profile.demoDataDesc')}</AppText>
            <Button
              label={t('profile.loadDemo')}
              onPress={() => {
                void loadDemoData().then(() => toast(t('profile.demoLoaded'), 'success'));
              }}
              icon="flask-outline"
              variant="secondary"
              size="sm"
            />
            <Button
              label={t('profile.clearData')}
              onPress={() => {
                void clearMyData().then(() => toast(t('profile.dataCleared'), 'info'));
              }}
              icon="trash-outline"
              variant="ghost"
              size="sm"
            />
          </Card>
        </>
      ) : null}
    </>
  );

  return (
    <Screen>
      <ScreenHeader title={t('profile.title')} helpTopic="profile" />

      <View style={[styles.layout, isWide && styles.layoutWide]}>
        <View style={[styles.column, isWide && styles.columnWide]}>{profileColumn}</View>
        <View style={[styles.column, isWide && styles.columnWide]}>{settingsColumn}</View>
      </View>

      <SectionHeader title={t('common.settings')} />
      <Card style={styles.accountActions}>
        <Button
          label={t('auth.signOut')}
          onPress={confirmSignOut}
          variant="secondary"
          icon="log-out-outline"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('profile.deleteAccount')}
          onPress={confirmDelete}
          style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="trash-outline" size={19} color={palette.dangerText} />
          <AppText variant="label" color={palette.dangerText}>
            {t('profile.deleteAccount')}
          </AppText>
        </Pressable>
        <AppText variant="caption" align="center">
          {t('profile.deleteAccountBody')}
        </AppText>
      </Card>

      <AppText variant="caption" align="center" style={styles.footer}>
        Kaluguroo {version}
      </AppText>
    </Screen>
  );
}

function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: value }}
      aria-checked={value}
      onPress={() => onChange(!value)}
      style={({ pressed }) => [
        styles.toggleRow,
        !last && styles.toggleDivider,
        pressed && { opacity: 0.75 },
      ]}>
      <View style={styles.toggleIcon}>
        <Ionicons name={icon} size={20} color={palette.primaryPressed} />
      </View>
      <View style={styles.toggleText}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="caption">{subtitle}</AppText>
      </View>
      {/* Decorative only: the whole row is the accessible switch. */}
      <View
        pointerEvents="none"
        style={styles.switchWrap}
        aria-hidden
        importantForAccessibility="no">
        <View style={[styles.track, value && styles.trackOn]}>
          <View style={[styles.thumb, value && styles.thumbOn]} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  layout: { gap: spacing.md },
  layoutWide: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xl },
  column: { gap: 0 },
  columnWide: { flex: 1, minWidth: 0 },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    backgroundColor: palette.primaryAction,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountText: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flexShrink: 1 },
  planCard: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  planItem: { flex: 1, alignItems: 'center', gap: 1 },
  planDivider: { width: StyleSheet.hairlineWidth, height: 46, backgroundColor: palette.border },
  editButton: { marginTop: spacing.md },
  textSizeCard: { gap: spacing.md },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  previewText: { flex: 1 },
  aiCard: { gap: spacing.md },
  aiHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  aiHeaderText: { flex: 1, gap: 2 },
  aiActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  flexButton: { flexGrow: 1, flexBasis: 140 },
  aiLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 44 },
  aiLinkText: { flex: 1 },
  aiTestRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  aiTestBox: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceMuted,
  },
  aboutCard: { overflow: 'hidden' },
  aboutInner: { paddingHorizontal: spacing.lg },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 64,
  },
  toggleDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  toggleIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: { flex: 1, gap: 1 },
  switchWrap: {
    width: 52,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: 52,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: palette.borderStrong,
    padding: 4,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: palette.primaryAction },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: palette.white,
  },
  thumbOn: { transform: [{ translateX: 20 }] },
  devCard: { gap: spacing.sm },
  accountActions: { gap: spacing.md },
  deleteButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.dangerSoft,
    backgroundColor: palette.dangerSoft,
  },
  footer: { marginTop: spacing.xl },
});
