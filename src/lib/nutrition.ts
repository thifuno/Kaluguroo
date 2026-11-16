import type {
  ActivityLevel,
  FoodItem,
  FoodLog,
  HealthGoal,
  HealthProfile,
  MacroTotals,
  NutritionPlan,
} from '@/types/models';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const GOAL_ADJUSTMENT: Record<HealthGoal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function calcBmi(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const meters = heightCm / 100;
  return round(weightKg / (meters * meters), 1);
}

export function bmiCategory(bmi: number): NutritionPlan['bmiCategory'] {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

/** Mifflin-St Jeor equation. */
export function calcBmr(profile: Pick<HealthProfile, 'gender' | 'weightKg' | 'heightCm' | 'age'>): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  if (profile.gender === 'male') return round(base + 5);
  if (profile.gender === 'female') return round(base - 161);
  return round(base - 78); // neutral midpoint for "other"
}

export function calcTdee(bmr: number, activityLevel: ActivityLevel): number {
  return round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Daily calorie target from TDEE and goal.
 * Never recommends less than 1,200 kcal (safety floor for a consumer app).
 */
export function calcCalorieTarget(tdee: number, goal: HealthGoal): number {
  return round(clamp(tdee + GOAL_ADJUSTMENT[goal], 1200, 6000));
}

export function calcMacros(calorieTarget: number): Pick<NutritionPlan, 'proteinG' | 'carbsG' | 'fatG'> {
  // 30% protein / 40% carbs / 30% fat
  return {
    proteinG: round((calorieTarget * 0.3) / 4),
    carbsG: round((calorieTarget * 0.4) / 4),
    fatG: round((calorieTarget * 0.3) / 9),
  };
}

export function calcPlan(profile: HealthProfile): NutritionPlan {
  const bmi = calcBmi(profile.weightKg, profile.heightCm);
  const bmr = calcBmr(profile);
  const tdee = calcTdee(bmr, profile.activityLevel);
  const calorieTarget = calcCalorieTarget(tdee, profile.goal);
  const macros = calcMacros(calorieTarget);
  return { bmi, bmiCategory: bmiCategory(bmi), bmr, tdee, calorieTarget, ...macros };
}

export function scaleFood(food: FoodItem, servings: number): MacroTotals {
  const factor = Math.max(servings, 0);
  return {
    calories: round(food.calories * factor),
    protein: round(food.protein * factor, 1),
    carbs: round(food.carbs * factor, 1),
    fat: round(food.fat * factor, 1),
  };
}

export function sumMacros(items: Pick<FoodLog, 'calories' | 'protein' | 'carbs' | 'fat'>[]): MacroTotals {
  return items.reduce<MacroTotals>(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function caloriesBurnedPerMinute(met: number, weightKg: number): number {
  // MET formula: kcal/min = MET * 3.5 * kg / 200
  return round((met * 3.5 * weightKg) / 200, 1);
}

export const EXERCISE_PRESETS = [
  { id: 'walk', name: 'เดินเร็ว', nameEn: 'Brisk walk', met: 4.3 },
  { id: 'run', name: 'วิ่ง', nameEn: 'Running', met: 9.8 },
  { id: 'cycle', name: 'ปั่นจักรยาน', nameEn: 'Cycling', met: 7.5 },
  { id: 'swim', name: 'ว่ายน้ำ', nameEn: 'Swimming', met: 8.0 },
  { id: 'weights', name: 'เวทเทรนนิ่ง', nameEn: 'Weight training', met: 5.0 },
  { id: 'yoga', name: 'โยคะ', nameEn: 'Yoga', met: 2.5 },
] as const;
