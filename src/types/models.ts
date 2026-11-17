export type Language = 'th' | 'en';

export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type HealthGoal = 'lose' | 'maintain' | 'gain';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/** User-selected text size. Applied to every AppText and form control. */
export type TextSize = 'normal' | 'large' | 'xlarge';

export type FoodCategory =
  | 'rice'
  | 'noodles'
  | 'soup'
  | 'meat'
  | 'seafood'
  | 'vegetable'
  | 'fruit'
  | 'dessert'
  | 'drink'
  | 'snack'
  | 'other';

/** Nutrition values are stored per serving (see servingGrams). */
export interface FoodItem {
  id: string;
  name: string;
  nameEn: string;
  category: FoodCategory;
  servingLabel: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isCustom?: boolean;
  isFavorite?: boolean;
}

export interface FoodLog {
  id: string;
  foodId: string;
  name: string;
  meal: MealType;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD (local)
  createdAt: string;
  source: 'manual' | 'scan' | 'custom';
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  name: string;
  minutes: number;
  caloriesBurned: number;
  date: string;
  createdAt: string;
}

export interface HealthProfile {
  displayName: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: HealthGoal;
}

export interface NutritionPlan {
  bmi: number;
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Session {
  userId: string;
  email: string;
  provider: 'email' | 'google';
  createdAt: string;
}

/** Vision provider used for AI food photo analysis. */
export type AiProvider = 'gemini' | 'openai';

export interface AiSettings {
  provider: AiProvider;
  /**
   * User-supplied provider key. Stored only on this device; an empty string
   * disables AI scanning. Never ship a provider key inside the repository.
   */
  apiKey: string;
}

export interface UserPreferences {
  notifications: {
    meals: boolean;
    weekly: boolean;
    water: boolean;
  };
  privacy: {
    analytics: boolean;
    shareHealthData: boolean;
  };
  textSize: TextSize;
  ai: AiSettings;
  /** First-run 3-step guide on the home screen has been dismissed. */
  tourCompleted: boolean;
}

export interface AppState {
  version: 1;
  /** Local account that owns the on-device data below (mock auth only). */
  ownerUserId?: string | null;
  session: Session | null;
  profile: HealthProfile | null;
  language: Language;
  preferences: UserPreferences;
  foodLogs: FoodLog[];
  weightLogs: WeightLog[];
  activityLogs: ActivityLog[];
  customFoods: FoodItem[];
  favoriteFoodIds: string[];
  demoDataLoaded: boolean;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
