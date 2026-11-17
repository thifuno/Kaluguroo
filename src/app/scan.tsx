import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { HelpSheet } from '@/components/ui/help-sheet';
import { ErrorState } from '@/components/ui/states';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { palette, radius, spacing } from '@/constants/theme';
import type { TranslationKey } from '@/lib/i18n';
import {
  analyzeFoodImage,
  isAiConfigured,
  type FoodAnalysis,
  type FoodAnalysisErrorCode,
} from '@/services/ai/food-analysis';
import { useApp } from '@/store/app-provider';
import type { FoodItem, MealType } from '@/types/models';

type ScanState = 'camera' | 'preview' | 'analyzing' | 'result' | 'unavailable' | 'error';

const AI_ERROR_KEYS: Record<FoodAnalysisErrorCode, TranslationKey> = {
  auth: 'scan.aiError.auth',
  rate_limit: 'scan.aiError.rate_limit',
  network: 'scan.aiError.network',
  not_food: 'scan.aiError.not_food',
  too_large: 'scan.aiError.too_large',
  invalid: 'scan.aiError.invalid',
  unknown: 'scan.aiError.unknown',
};

const MEALS: { value: MealType; labelKey: 'home.breakfast' | 'home.lunch' | 'home.dinner' | 'home.snack' }[] = [
  { value: 'breakfast', labelKey: 'home.breakfast' },
  { value: 'lunch', labelKey: 'home.lunch' },
  { value: 'dinner', labelKey: 'home.dinner' },
  { value: 'snack', labelKey: 'home.snack' },
];

function defaultMeal(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

export default function ScanScreen() {
  const { t, addFoodLog, preferences } = useApp();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const aiReady = isAiConfigured(preferences.ai);

  const [state, setState] = useState<ScanState>('camera');
  const [photo, setPhoto] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [helpVisible, setHelpVisible] = useState(false);

  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [editName, setEditName] = useState('');
  const [editCalories, setEditCalories] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFat, setEditFat] = useState('');
  const [meal, setMeal] = useState<MealType>(defaultMeal());

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (picture?.uri) {
        setPhoto(picture.uri);
        setState('preview');
      }
    } catch {
      setErrorMessage(t('scan.cameraError'));
      setState('error');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhoto(result.assets[0].uri);
      setState('preview');
    }
  };

  const analyze = async () => {
    if (!photo) return;
    setState('analyzing');
    const response = await analyzeFoodImage(photo, preferences.ai);
    if (response.status === 'ok') {
      setAnalysis(response.analysis);
      setEditName(response.analysis.name);
      setEditCalories(String(response.analysis.calories));
      setEditProtein(String(response.analysis.protein));
      setEditCarbs(String(response.analysis.carbs));
      setEditFat(String(response.analysis.fat));
      setState('result');
      return;
    }
    if (response.status === 'not_configured') {
      setState('unavailable');
      return;
    }
    setErrorMessage(t(AI_ERROR_KEYS[response.code]));
    setErrorDetail(response.message);
    setState('error');
  };

  const saveResult = () => {
    if (!analysis) return;
    const food: FoodItem = {
      id: `scan-${Date.now()}`,
      name: editName.trim() || analysis.name,
      nameEn: editName.trim() || analysis.name,
      category: 'other',
      servingLabel: t('scan.resultTitle'),
      servingGrams: 0,
      calories: Number(editCalories) || 0,
      protein: Number(editProtein) || 0,
      carbs: Number(editCarbs) || 0,
      fat: Number(editFat) || 0,
    };
    addFoodLog({ food, meal, servings: 1, source: 'scan' });
    toast(t('scan.saved'), 'success');
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  // AI is optional in this build, so the manual form is the reliable fallback.
  const goManual = () => {
    router.replace({ pathname: '/(tabs)/food', params: { custom: '1' } });
  };

  const retake = () => {
    setPhoto(null);
    setState('camera');
  };

  const goAiSettings = () => {
    router.replace('/(tabs)/profile');
  };

  const helpButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('help.open')}
      onPress={() => setHelpVisible(true)}
      style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}>
      <Ionicons name="help-circle-outline" size={24} color={palette.white} />
    </Pressable>
  );

  if (!permission) {
    return (
      <SafeAreaView style={styles.permissionRoot}>
        <ActivityIndicator color={palette.primaryAction} />
      </SafeAreaView>
    );
  }

  // The permission card only owns the screen while the user is still trying to
  // use the camera. A photo picked from the gallery must still reach the
  // preview/analysis flow even when camera access was denied.
  if (!permission.granted && state === 'camera') {
    return (
      <SafeAreaView style={styles.permissionRoot}>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera-outline" size={34} color={palette.primaryPressed} />
          </View>
          <AppText variant="heading" align="center">
            {t('scan.permissionTitle')}
          </AppText>
          <AppText variant="body" align="center" color={palette.textMuted}>
            {permission.canAskAgain ? t('scan.permissionBody') : t('scan.permissionDenied')}
          </AppText>
          <AppText variant="caption" align="center">
            {t('scan.cameraHint')}
          </AppText>
          <Button
            label={permission.canAskAgain ? t('scan.grantPermission') : t('scan.openSettings')}
            onPress={() => {
              if (permission.canAskAgain) {
                void requestPermission();
              } else {
                void Linking.openSettings();
              }
            }}
            icon="camera"
          />
          <Button
            label={t('scan.pickImage')}
            onPress={() => void pickImage()}
            variant="soft"
            icon="images-outline"
          />
          <Button
            label={t('scan.manualEntry')}
            onPress={goManual}
            variant="soft"
            icon="create-outline"
          />
          <Button label={t('common.notNow')} onPress={close} variant="ghost" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      {photo && state !== 'camera' ? (
        <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : permission.granted ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
      ) : (
        <View style={styles.cameraPlaceholder} />
      )}

      <View style={styles.scrimTop} />

      <SafeAreaView style={styles.overlay} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={close}
            style={styles.headerButton}>
            <Ionicons name="close" size={24} color={palette.white} />
          </Pressable>
          <View style={styles.headerTitle}>
            <AppText variant="bodyStrong" color={palette.white}>
              {t('scan.title')}
            </AppText>
            <AppText variant="caption" color="rgba(255,255,255,0.85)" numberOfLines={2}>
              {t('scan.subtitle')}
            </AppText>
          </View>
          {helpButton}
        </View>
      </SafeAreaView>

      {state === 'camera' ? (
        <View style={[styles.cameraFooter, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.cameraFooterInner}>
            <View style={styles.cameraHint}>
              <Badge label={t('common.estimate')} tone="warning" />
              <AppText variant="body" color={palette.white} style={styles.hintText}>
                {t('scan.cameraHint')}
              </AppText>
            </View>
            <View style={styles.cameraControls}>
              <View style={styles.captureItem}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('scan.pickImage')}
                  onPress={() => void pickImage()}
                  style={styles.sideButton}>
                  <Ionicons name="images-outline" size={24} color={palette.white} />
                </Pressable>
                <AppText variant="caption" color={palette.white} align="center">
                  {t('scan.gallery')}
                </AppText>
              </View>

              <View style={styles.captureItem}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('scan.shutter')}
                  accessibilityHint={t('scan.cameraHint')}
                  onPress={() => void takePhoto()}
                  style={styles.shutterOuter}>
                  <View style={styles.shutterInner} />
                </Pressable>
                <AppText variant="label" color={palette.white} align="center">
                  {t('scan.shutter')}
                </AppText>
              </View>

              <View style={styles.captureItem}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('scan.flip')}
                  onPress={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
                  style={styles.sideButton}>
                  <Ionicons name="camera-reverse-outline" size={24} color={palette.white} />
                </Pressable>
                <AppText variant="caption" color={palette.white} align="center">
                  {t('scan.flip')}
                </AppText>
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {state === 'preview' ? (
        <View style={styles.panelWrap}>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Badge label={t('scan.imageReady')} tone="success" />
              <AppText variant="caption" align="right" style={styles.panelCaption}>
                {aiReady ? t('scan.imageReadyAiBody') : t('scan.imageReadyBody')}
              </AppText>
            </View>

            {!aiReady ? (
              <View style={styles.noticeBox}>
                <Ionicons name="warning-outline" size={22} color={palette.warningText} />
                <View style={styles.noticeText}>
                  <AppText variant="bodyStrong" color={palette.warningText}>
                    {t('scan.notConnectedTitle')}
                  </AppText>
                  <AppText variant="caption">{t('scan.notConnectedBody')}</AppText>
                </View>
              </View>
            ) : null}

            {aiReady ? (
              <Button
                label={t('scan.analyze')}
                onPress={() => void analyze()}
                icon="sparkles"
              />
            ) : (
              <Button
                label={t('scan.openAiSettings')}
                onPress={goAiSettings}
                icon="settings-outline"
              />
            )}

            <Button
              label={t('scan.manualEntry')}
              onPress={goManual}
              icon="create-outline"
              variant="secondary"
            />
            <Button label={t('scan.retake')} onPress={retake} variant="ghost" icon="camera-outline" />

            {!aiReady ? (
              <AppText variant="caption" align="center">
                {t('scan.notConnectedHint')}
              </AppText>
            ) : null}
          </View>
        </View>
      ) : null}

      {state === 'analyzing' ? (
        <View style={[styles.centerOverlay, { paddingBottom: insets.bottom }]}>
          <View style={styles.analyzingCard}>
            <ActivityIndicator color={palette.primaryAction} size="large" />
            <AppText variant="bodyStrong">{t('scan.analyzing')}</AppText>
            <AppText variant="caption" align="center">
              {t('scan.resultNote')}
            </AppText>
          </View>
        </View>
      ) : null}

      {state === 'unavailable' ? (
        <View style={styles.panelWrap}>
          <View style={styles.panel}>
            <View style={styles.noticeBox}>
              <Ionicons name="cloud-offline-outline" size={22} color={palette.warningText} />
              <View style={styles.noticeText}>
                <AppText variant="bodyStrong" color={palette.warningText}>
                  {t('scan.notConnectedTitle')}
                </AppText>
                <AppText variant="caption">{t('scan.notConnectedBody')}</AppText>
              </View>
            </View>
            <AppText variant="body">{t('scan.notConnectedHint')}</AppText>
            <Button
              label={t('scan.openAiSettings')}
              onPress={goAiSettings}
              icon="settings-outline"
            />
            <Button
              label={t('scan.manualEntry')}
              onPress={goManual}
              icon="create-outline"
              variant="secondary"
            />
            <Button label={t('scan.retake')} onPress={retake} variant="ghost" icon="camera-outline" />
          </View>
        </View>
      ) : null}

      {state === 'error' ? (
        <View style={styles.panelWrap}>
          <View style={styles.panel}>
            <ErrorState
              title={t('scan.errorTitle')}
              body={errorMessage ?? t('scan.errorBody')}
              retryLabel={t('common.retry')}
              onRetry={() => void analyze()}
            />
            {errorDetail ? (
              <AppText variant="caption" color={palette.textMuted}>
                {t('scan.errorDetail')}
              </AppText>
            ) : null}
            {errorDetail ? (
              <AppText variant="caption" color={palette.textMuted}>
                {errorDetail}
              </AppText>
            ) : null}
            <Button label={t('scan.manualEntry')} onPress={goManual} icon="create-outline" />
            <Button label={t('scan.retake')} onPress={retake} variant="secondary" icon="camera-outline" />
          </View>
        </View>
      ) : null}

      {state === 'result' && analysis ? (
        <View style={styles.panelWrap}>
          <View style={styles.resultPanel}>
            <View style={styles.resultHeader}>
              <View style={styles.resultHeaderText}>
                <AppText variant="subheading">{t('scan.resultTitle')}</AppText>
                <AppText variant="caption">{t('scan.resultNote')}</AppText>
              </View>
              <Badge label={t('common.estimate')} tone="warning" />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultContent}>
              <TextField label={t('food.name')} value={editName} onChangeText={setEditName} />
              <View style={styles.resultRow}>
                <TextField
                  label={t('food.calories')}
                  value={editCalories}
                  onChangeText={setEditCalories}
                  keyboardType="number-pad"
                  containerStyle={styles.flex}
                />
                <TextField
                  label={`${t('food.protein')} (g)`}
                  value={editProtein}
                  onChangeText={setEditProtein}
                  keyboardType="decimal-pad"
                  containerStyle={styles.flex}
                />
              </View>
              <View style={styles.resultRow}>
                <TextField
                  label={`${t('food.carbs')} (g)`}
                  value={editCarbs}
                  onChangeText={setEditCarbs}
                  keyboardType="decimal-pad"
                  containerStyle={styles.flex}
                />
                <TextField
                  label={`${t('food.fat')} (g)`}
                  value={editFat}
                  onChangeText={setEditFat}
                  keyboardType="decimal-pad"
                  containerStyle={styles.flex}
                />
              </View>

              <AppText variant="label" color={palette.textMuted}>
                {t('food.chooseMeal')}
              </AppText>
              <View style={styles.mealRow}>
                {MEALS.map((option) => (
                  <Chip
                    key={option.value}
                    label={t(option.labelKey)}
                    selected={meal === option.value}
                    onPress={() => setMeal(option.value)}
                  />
                ))}
              </View>
              <Button label={t('scan.saveToDiary')} onPress={saveResult} icon="checkmark" />
              <Button label={t('scan.retake')} variant="secondary" onPress={retake} />
            </ScrollView>
          </View>
        </View>
      ) : null}

      <HelpSheet topic="scan" visible={helpVisible} onClose={() => setHelpVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111111' },
  cameraPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#111111',
  },
  permissionRoot: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.xl,
    gap: spacing.md,
    width: '100%',
    maxWidth: 420,
  },
  permissionIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, alignItems: 'center', gap: 1 },
  cameraFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  cameraFooterInner: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: spacing.lg },
  cameraHint: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  hintText: { flex: 1 },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  captureItem: { alignItems: 'center', gap: spacing.xs, width: 92 },
  sideButton: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: palette.white,
  },
  panelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: palette.background,
    borderTopLeftRadius: radius.xl + 6,
    borderTopRightRadius: radius.xl + 6,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  panelCaption: { flex: 1 },
  noticeBox: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: palette.warningSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  noticeText: { flex: 1, gap: 2 },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: spacing.xl,
  },
  analyzingCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: 340,
  },
  resultPanel: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '86%',
    backgroundColor: palette.background,
    borderTopLeftRadius: radius.xl + 6,
    borderTopRightRadius: radius.xl + 6,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  resultHeaderText: { flex: 1, gap: 2 },
  resultContent: { gap: spacing.md, paddingBottom: spacing.md },
  resultRow: { flexDirection: 'row', gap: spacing.sm },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  flex: { flex: 1 },
});
