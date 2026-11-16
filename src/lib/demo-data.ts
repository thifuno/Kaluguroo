import type { AppState } from '@/types/models';
import { SAMPLE_FOODS } from '@/constants/foods';
import { addDays, toDateKey, todayKey } from '@/lib/date';
import { calcPlan } from '@/lib/nutrition';

const FOOD = Object.fromEntries(SAMPLE_FOODS.map((food) => [food.id, food]));
const DAY = 24 * 60 * 60 * 1000;

function isoAt(daysAgo: number, hour: number, minute = 0): string {
  const date = new Date(Date.now() - daysAgo * DAY);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function demoLog(
  id: string,
  foodId: string,
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  servings: number,
  daysAgo: number,
  hour: number,
) {
  const food = FOOD[foodId];
  const date = toDateKey(addDays(new Date(), -daysAgo));
  return {
    id,
    foodId,
    name: food.name,
    meal,
    servings,
    calories: Math.round(food.calories * servings),
    protein: Math.round(food.protein * servings * 10) / 10,
    carbs: Math.round(food.carbs * servings * 10) / 10,
    fat: Math.round(food.fat * servings * 10) / 10,
    date,
    createdAt: isoAt(daysAgo, hour),
    source: 'manual' as const,
  };
}

/** Deterministic sample data so screens can be reviewed without a backend. */
export function buildDemoData(): Partial<AppState> {
  const today = todayKey();
  const foodLogs = [
    demoLog('demo-b1', 'boiled-egg', 'breakfast', 2, 0, 7),
    demoLog('demo-b2', 'whole-wheat-bread', 'breakfast', 1, 0, 7),
    demoLog('demo-b3', 'americano', 'breakfast', 1, 0, 8),
    demoLog('demo-l1', 'rice-chicken', 'lunch', 1, 0, 12),
    demoLog('demo-s1', 'banana', 'snack', 1, 0, 15),
    demoLog('demo-p1', 'rice-basil', 'dinner', 1, 1, 18),
    demoLog('demo-p2', 'somtam', 'lunch', 1, 1, 12),
    demoLog('demo-p3', 'grilled-chicken', 'dinner', 1.5, 2, 18),
    demoLog('demo-p4', 'brown-rice', 'lunch', 1, 2, 12),
    demoLog('demo-p5', 'pad-thai', 'dinner', 1, 3, 19),
    demoLog('demo-p6', 'tom-yum', 'lunch', 1, 3, 12),
    demoLog('demo-p7', 'garden-salad', 'lunch', 1, 4, 12),
    demoLog('demo-p8', 'salmon', 'dinner', 1, 4, 18),
    demoLog('demo-p9', 'boat-noodle', 'lunch', 1, 5, 12),
    demoLog('demo-p10', 'kanom-krok', 'snack', 1, 5, 15),
    demoLog('demo-p11', 'rice-shrimp', 'dinner', 1, 6, 18),
  ];

  const startWeight = 64.2;
  const weightLogs = Array.from({ length: 14 }, (_, index) => {
    const daysAgo = 13 - index;
    const drift = (13 - daysAgo) * 0.12;
    return {
      id: `demo-w-${index}`,
      date: toDateKey(addDays(new Date(), -daysAgo)),
      weightKg: Math.round((startWeight - drift) * 10) / 10,
      createdAt: isoAt(daysAgo, 7, 30),
    };
  });

  const profile = {
    displayName: 'คุณฟ้า',
    age: 29,
    gender: 'female' as const,
    heightCm: 165,
    weightKg: 62.5,
    targetWeightKg: 58,
    activityLevel: 'moderate' as const,
    goal: 'lose' as const,
  };

  return {
    ownerUserId: DEMO_SESSION.userId,
    profile,
    demoDataLoaded: true,
    foodLogs,
    weightLogs,
    activityLogs: [
      {
        id: 'demo-a1',
        name: 'เดินเร็ว',
        minutes: 30,
        caloriesBurned: 115,
        date: today,
        createdAt: isoAt(0, 7, 0),
      },
      {
        id: 'demo-a2',
        name: 'เวทเทรนนิ่ง',
        minutes: 45,
        caloriesBurned: 210,
        date: toDateKey(addDays(new Date(), -1)),
        createdAt: isoAt(1, 18, 0),
      },
    ],
    favoriteFoodIds: ['rice-chicken', 'grilled-chicken', 'banana'],
  };
}

export const DEMO_SESSION = {
  userId: 'demo-user',
  email: 'demo@kaluguroo.app',
  provider: 'email' as const,
  createdAt: new Date().toISOString(),
};

export function demoPlan() {
  const data = buildDemoData();
  return data.profile ? calcPlan(data.profile) : null;
}
