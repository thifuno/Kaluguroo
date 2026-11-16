import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { palette, radius, spacing } from '@/constants/theme';
import type { TranslationKey } from '@/lib/i18n';
import { useApp } from '@/store/app-provider';

export type HelpTopic = 'home' | 'food' | 'health' | 'profile' | 'diary' | 'scan';

const TOPICS: Record<HelpTopic, { titleKey: TranslationKey; steps: TranslationKey[] }> = {
  home: {
    titleKey: 'help.home.title',
    steps: ['help.home.s1', 'help.home.s2', 'help.home.s3'],
  },
  food: {
    titleKey: 'help.food.title',
    steps: ['help.food.s1', 'help.food.s2', 'help.food.s3'],
  },
  health: {
    titleKey: 'help.health.title',
    steps: ['help.health.s1', 'help.health.s2', 'help.health.s3'],
  },
  profile: {
    titleKey: 'help.profile.title',
    steps: ['help.profile.s1', 'help.profile.s2', 'help.profile.s3'],
  },
  diary: {
    titleKey: 'help.diary.title',
    steps: ['help.diary.s1', 'help.diary.s2', 'help.diary.s3'],
  },
  scan: {
    titleKey: 'help.scan.title',
    steps: ['help.scan.s1', 'help.scan.s2', 'help.scan.s3'],
  },
};

export function HelpSheet({
  topic,
  visible,
  onClose,
}: {
  topic: HelpTopic;
  visible: boolean;
  onClose: () => void;
}) {
  const { t } = useApp();
  const content = TOPICS[topic];

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      closeLabel={t('common.close')}
      title={t('help.title')}
      subtitle={t(content.titleKey)}
      footer={<Button label={t('help.gotIt')} onPress={onClose} icon="checkmark" />}>
      {content.steps.map((key, index) => (
        <View key={key} style={styles.step}>
          <View style={styles.stepNumber}>
            <AppText variant="bodyStrong" color={palette.white}>
              {index + 1}
            </AppText>
          </View>
          <AppText variant="body" style={styles.stepText}>
            {t(key)}
          </AppText>
        </View>
      ))}
      <View style={styles.tip}>
        <Ionicons name="bulb-outline" size={20} color={palette.warningText} />
        <AppText variant="caption" style={styles.stepText}>
          {t('help.tip')}
        </AppText>
      </View>
    </ModalSheet>
  );
}

export function HelpButton({ topic }: { topic: HelpTopic }) {
  const { t } = useApp();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('help.open')}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.helpButton, pressed && { opacity: 0.75 }]}>
        <Ionicons name="help-circle-outline" size={21} color={palette.primaryPressed} />
        <AppText variant="label" color={palette.primaryPressed}>
          {t('common.help')}
        </AppText>
      </Pressable>
      <HelpSheet topic={topic} visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  helpButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.primaryBorder,
    backgroundColor: palette.surface,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: palette.primaryAction,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1 },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: palette.warningSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
});
