import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppState } from '@/types/models';

const STATE_KEY = 'kaluguroo:app-state:v1';
const ACCOUNTS_KEY = 'kaluguroo:local-accounts:v1';

export interface LocalAccount {
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

export const DEFAULT_STATE: AppState = {
  version: 1,
  ownerUserId: null,
  session: null,
  profile: null,
  language: 'th',
  preferences: {
    notifications: { meals: true, weekly: true, water: false },
    privacy: { analytics: false, shareHealthData: false },
    textSize: 'normal',
    ai: { provider: 'gemini', apiKey: '' },
    tourCompleted: false,
  },
  foodLogs: [],
  weightLogs: [],
  activityLogs: [],
  customFoods: [],
  favoriteFoodIds: [],
  demoDataLoaded: false,
};

export async function loadAppState(): Promise<AppState | null> {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== 1) return null;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      preferences: {
        ...DEFAULT_STATE.preferences,
        ...parsed.preferences,
        notifications: {
          ...DEFAULT_STATE.preferences.notifications,
          ...parsed.preferences?.notifications,
        },
        privacy: { ...DEFAULT_STATE.preferences.privacy, ...parsed.preferences?.privacy },
        ai: { ...DEFAULT_STATE.preferences.ai, ...parsed.preferences?.ai },
      },
    };
  } catch (error) {
    console.warn('[storage] failed to load app state', error);
    return null;
  }
}

export async function saveAppState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('[storage] failed to save app state', error);
  }
}

export async function loadAccounts(): Promise<LocalAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as LocalAccount[]) : [];
  } catch {
    return [];
  }
}

export async function saveAccounts(accounts: LocalAccount[]): Promise<void> {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function clearAppState(): Promise<void> {
  await AsyncStorage.multiRemove([STATE_KEY, ACCOUNTS_KEY]);
}
