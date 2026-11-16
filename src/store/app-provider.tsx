import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { SAMPLE_FOODS } from '@/constants/foods';
import { DEMO_SESSION, buildDemoData } from '@/lib/demo-data';
import { todayKey } from '@/lib/date';
import { translate, type TranslationKey } from '@/lib/i18n';
import { calcPlan, sumMacros } from '@/lib/nutrition';
import {
  DEFAULT_STATE,
  clearAppState,
  loadAccounts,
  loadAppState,
  saveAccounts,
  saveAppState,
  type LocalAccount,
} from '@/lib/storage';
import {
  AuthError,
  googleSignInUnavailable,
  mockSignIn,
  mockSignUp,
} from '@/services/auth/mock-auth';
import type {
  AppState,
  FoodItem,
  FoodLog,
  HealthProfile,
  Language,
  MacroTotals,
  MealType,
  NutritionPlan,
  Session,
  UserPreferences,
} from '@/types/models';

interface AddFoodInput {
  food: FoodItem;
  meal: MealType;
  servings: number;
  date?: string;
  source?: FoodLog['source'];
}

interface AddActivityInput {
  name: string;
  minutes: number;
  caloriesBurned: number;
  date?: string;
}

interface AppContextValue extends AppState {
  hydrated: boolean;
  onboarded: boolean;
  plan: NutritionPlan | null;
  allFoods: FoodItem[];
  todayLogs: FoodLog[];
  todayTotals: MacroTotals;
  todayBurned: number;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (profile: HealthProfile) => Promise<void>;
  updateProfile: (profile: HealthProfile) => Promise<void>;
  addFoodLog: (input: AddFoodInput) => FoodLog;
  updateFoodLog: (id: string, patch: Partial<FoodLog>) => void;
  deleteFoodLog: (id: string) => void;
  logsForDate: (date: string) => FoodLog[];
  addWeight: (weightKg: number, date?: string) => void;
  addActivity: (input: AddActivityInput) => void;
  addCustomFood: (food: Omit<FoodItem, 'id' | 'isCustom'>) => FoodItem;
  toggleFavorite: (foodId: string) => void;
  setLanguage: (language: Language) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  loadDemoData: () => Promise<void>;
  clearMyData: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

/** Per-account data. Reset when a different local account signs in. */
const EMPTY_USER_DATA = {
  profile: null,
  foodLogs: [],
  weightLogs: [],
  activityLogs: [],
  customFoods: [],
  favoriteFoodIds: [],
  demoDataLoaded: false,
} satisfies Partial<AppState>;

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeSession(account: LocalAccount): Session {
  return {
    userId: `local-${account.email}`,
    email: account.email,
    provider: 'email',
    createdAt: account.createdAt,
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [accounts, setAccounts] = useState<LocalAccount[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [stored, storedAccounts] = await Promise.all([loadAppState(), loadAccounts()]);
      if (!active) return;
      if (stored) setState(stored);
      setAccounts(storedAccounts);
      setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveAppState(state);
  }, [state, hydrated]);

  const signIn = useCallback(async (email: string, password: string) => {
    const account = mockSignIn(accounts, { email, password });
    const session = makeSession(account);
    setState((current) => {
      // Local data belongs to one account at a time; a different account starts clean.
      const sameOwner = !current.ownerUserId || current.ownerUserId === session.userId;
      return sameOwner
        ? { ...current, session, ownerUserId: session.userId }
        : { ...current, ...EMPTY_USER_DATA, session, ownerUserId: session.userId };
    });
  }, [accounts]);

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const nextAccounts = await mockSignUp(accounts, input);
      await saveAccounts(nextAccounts);
      setAccounts(nextAccounts);
      const account = nextAccounts[nextAccounts.length - 1];
      const session = makeSession(account);
      // A brand-new account never inherits the previous session's health data.
      setState((current) => ({
        ...current,
        ...EMPTY_USER_DATA,
        session,
        ownerUserId: session.userId,
      }));
    },
    [accounts],
  );

  const signInWithGoogle = useCallback(async () => {
    googleSignInUnavailable();
  }, []);

  const signInDemo = useCallback(async () => {
    const demo = buildDemoData();
    setState((current) => ({
      ...current,
      ...demo,
      session: { ...DEMO_SESSION },
      ownerUserId: DEMO_SESSION.userId,
      language: current.language,
    }));
  }, []);

  const signOut = useCallback(async () => {
    setState((current) => ({ ...current, session: null }));
  }, []);

  const completeOnboarding = useCallback(async (profile: HealthProfile) => {
    setState((current) => ({
      ...current,
      profile,
      weightLogs:
        current.weightLogs.length === 0
          ? [
              {
                id: makeId('weight'),
                date: todayKey(),
                weightKg: profile.weightKg,
                createdAt: new Date().toISOString(),
              },
            ]
          : current.weightLogs,
    }));
  }, []);

  const updateProfile = useCallback(async (profile: HealthProfile) => {
    setState((current) => {
      const weightChanged = current.profile?.weightKg !== profile.weightKg;
      const logToday = current.weightLogs.find((log) => log.date === todayKey());
      let weightLogs = current.weightLogs;
      if (weightChanged) {
        const entry = {
          id: logToday?.id ?? makeId('weight'),
          date: todayKey(),
          weightKg: profile.weightKg,
          createdAt: new Date().toISOString(),
        };
        weightLogs = logToday
          ? current.weightLogs.map((log) => (log.id === logToday.id ? entry : log))
          : [...current.weightLogs, entry];
      }
      return { ...current, profile, weightLogs };
    });
  }, []);

  const addFoodLog = useCallback((input: AddFoodInput): FoodLog => {
    const { food, meal, servings } = input;
    const log: FoodLog = {
      id: makeId('log'),
      foodId: food.id,
      name: food.name,
      meal,
      servings,
      calories: Math.round(food.calories * servings),
      protein: Math.round(food.protein * servings * 10) / 10,
      carbs: Math.round(food.carbs * servings * 10) / 10,
      fat: Math.round(food.fat * servings * 10) / 10,
      date: input.date ?? todayKey(),
      createdAt: new Date().toISOString(),
      source: input.source ?? 'manual',
    };
    setState((current) => ({ ...current, foodLogs: [log, ...current.foodLogs] }));
    return log;
  }, []);

  const updateFoodLog = useCallback((id: string, patchLog: Partial<FoodLog>) => {
    setState((current) => ({
      ...current,
      foodLogs: current.foodLogs.map((log) => (log.id === id ? { ...log, ...patchLog } : log)),
    }));
  }, []);

  const deleteFoodLog = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      foodLogs: current.foodLogs.filter((log) => log.id !== id),
    }));
  }, []);

  const logsForDate = useCallback(
    (date: string) => state.foodLogs.filter((log) => log.date === date),
    [state.foodLogs],
  );

  const addWeight = useCallback((weightKg: number, date = todayKey()) => {
    setState((current) => {
      const existing = current.weightLogs.find((log) => log.date === date);
      const entry = {
        id: existing?.id ?? makeId('weight'),
        date,
        weightKg,
        createdAt: new Date().toISOString(),
      };
      return {
        ...current,
        weightLogs: existing
          ? current.weightLogs.map((log) => (log.id === existing.id ? entry : log))
          : [...current.weightLogs, entry],
        profile: current.profile ? { ...current.profile, weightKg } : current.profile,
      };
    });
  }, []);

  const addActivity = useCallback((input: AddActivityInput) => {
    const entry = {
      id: makeId('activity'),
      name: input.name,
      minutes: input.minutes,
      caloriesBurned: input.caloriesBurned,
      date: input.date ?? todayKey(),
      createdAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, activityLogs: [entry, ...current.activityLogs] }));
  }, []);

  const addCustomFood = useCallback((food: Omit<FoodItem, 'id' | 'isCustom'>): FoodItem => {
    const item: FoodItem = { ...food, id: makeId('custom'), isCustom: true };
    setState((current) => ({ ...current, customFoods: [item, ...current.customFoods] }));
    return item;
  }, []);

  const toggleFavorite = useCallback((foodId: string) => {
    setState((current) => ({
      ...current,
      favoriteFoodIds: current.favoriteFoodIds.includes(foodId)
        ? current.favoriteFoodIds.filter((id) => id !== foodId)
        : [...current.favoriteFoodIds, foodId],
    }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setState((current) => ({ ...current, language }));
  }, []);

  const updatePreferences = useCallback((patchPreferences: Partial<UserPreferences>) => {
    setState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        ...patchPreferences,
        notifications: {
          ...current.preferences.notifications,
          ...patchPreferences.notifications,
        },
        privacy: { ...current.preferences.privacy, ...patchPreferences.privacy },
      },
    }));
  }, []);

  const loadDemoData = useCallback(async () => {
    const demo = buildDemoData();
    setState((current) => {
      const session = current.session ?? { ...DEMO_SESSION };
      return {
        ...current,
        ...demo,
        session,
        ownerUserId: session.userId,
        language: current.language,
      };
    });
  }, []);

  const clearMyData = useCallback(async () => {
    setState((current) => ({
      ...current,
      foodLogs: [],
      weightLogs: [],
      activityLogs: [],
      favoriteFoodIds: [],
      customFoods: [],
      demoDataLoaded: false,
    }));
  }, []);

  const deleteAccount = useCallback(async () => {
    await clearAppState();
    setAccounts([]);
    setState(DEFAULT_STATE);
  }, []);

  const allFoods = useMemo(
    () => [...state.customFoods, ...SAMPLE_FOODS],
    [state.customFoods],
  );

  const plan = useMemo(() => (state.profile ? calcPlan(state.profile) : null), [state.profile]);

  const todayLogs = useMemo(
    () => state.foodLogs.filter((log) => log.date === todayKey()),
    [state.foodLogs],
  );

  const todayTotals = useMemo(() => sumMacros(todayLogs), [todayLogs]);

  const todayBurned = useMemo(
    () =>
      state.activityLogs
        .filter((log) => log.date === todayKey())
        .reduce((total, log) => total + log.caloriesBurned, 0),
    [state.activityLogs],
  );

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(state.language, key, vars),
    [state.language],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      hydrated,
      onboarded: Boolean(state.profile),
      plan,
      allFoods,
      todayLogs,
      todayTotals,
      todayBurned,
      t,
      signIn,
      signUp,
      signInWithGoogle,
      signInDemo,
      signOut,
      completeOnboarding,
      updateProfile,
      addFoodLog,
      updateFoodLog,
      deleteFoodLog,
      logsForDate,
      addWeight,
      addActivity,
      addCustomFood,
      toggleFavorite,
      setLanguage,
      updatePreferences,
      loadDemoData,
      clearMyData,
      deleteAccount,
    }),
    [
      state,
      hydrated,
      plan,
      allFoods,
      todayLogs,
      todayTotals,
      todayBurned,
      t,
      signIn,
      signUp,
      signInWithGoogle,
      signInDemo,
      signOut,
      completeOnboarding,
      updateProfile,
      addFoodLog,
      updateFoodLog,
      deleteFoodLog,
      logsForDate,
      addWeight,
      addActivity,
      addCustomFood,
      toggleFavorite,
      setLanguage,
      updatePreferences,
      loadDemoData,
      clearMyData,
      deleteAccount,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside <AppProvider>');
  return value;
}

export { AuthError };
