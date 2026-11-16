export interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: number;
  items?: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

export type FoodAnalysisResponse =
  | { status: 'ok'; analysis: FoodAnalysis }
  | { status: 'not_configured' }
  | { status: 'error'; message: string };

const ENDPOINT = process.env.EXPO_PUBLIC_AI_API_URL;
const TIMEOUT_MS = 30_000;

export function isAiConfigured(): boolean {
  return Boolean(ENDPOINT);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function parseAnalysis(payload: unknown): FoodAnalysis | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  if (typeof data.name !== 'string' || !data.name.trim()) return null;
  const fields = ['calories', 'protein', 'carbs', 'fat'] as const;
  if (!fields.every((field) => isFiniteNumber(data[field]))) return null;
  return {
    name: data.name.trim(),
    calories: Math.round(data.calories as number),
    protein: Math.round((data.protein as number) * 10) / 10,
    carbs: Math.round((data.carbs as number) * 10) / 10,
    fat: Math.round((data.fat as number) * 10) / 10,
    confidence: isFiniteNumber(data.confidence) ? (data.confidence as number) : undefined,
  };
}

/**
 * Sends a photo to the secure backend for analysis.
 *
 * IMPORTANT: this never fabricates a result. If no endpoint is configured the
 * caller receives `not_configured` and the UI must say so explicitly.
 */
export async function analyzeFoodImage(imageUri: string): Promise<FoodAnalysisResponse> {
  if (!ENDPOINT) {
    return { status: 'not_configured' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const imageResponse = await fetch(imageUri);
    const blob = await imageResponse.blob();

    const form = new FormData();
    // React Native's FormData accepts this file shape.
    form.append('image', {
      uri: imageUri,
      name: 'meal.jpg',
      type: blob.type || 'image/jpeg',
    } as unknown as Blob);

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: form,
      signal: controller.signal,
    });

    if (!response.ok) {
      return { status: 'error', message: `AI service responded with ${response.status}` };
    }

    const payload = await response.json();
    const analysis = parseAnalysis(payload);
    if (!analysis) {
      return { status: 'error', message: 'AI service returned an unexpected payload' };
    }
    return { status: 'ok', analysis };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown AI service error',
    };
  } finally {
    clearTimeout(timeout);
  }
}
