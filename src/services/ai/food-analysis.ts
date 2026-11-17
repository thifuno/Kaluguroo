import { Platform } from 'react-native';

import type { AiProvider, AiSettings } from '@/types/models';

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

export type FoodAnalysisErrorCode =
  | 'auth'
  | 'rate_limit'
  | 'network'
  | 'not_food'
  | 'too_large'
  | 'invalid'
  | 'unknown';

export type FoodAnalysisResponse =
  | { status: 'ok'; analysis: FoodAnalysis }
  | { status: 'not_configured' }
  | { status: 'error'; message: string; code: FoodAnalysisErrorCode };

export type AiTestResult =
  | { status: 'ok' }
  | { status: 'error'; code: FoodAnalysisErrorCode; message: string };

const ENDPOINT = process.env.EXPO_PUBLIC_AI_API_URL;
const GEMINI_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';
const OPENAI_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini';
const TIMEOUT_MS = 60_000;
/** Vision APIs accept larger payloads, but mobile networks do not. */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const PROMPT = `You are a nutrition assistant for Thai food.
Look at the meal photo and estimate the nutrition for the portion shown.
Rules:
- Only analyze food and drinks. If the photo has no food, set "isFood" to false and use zeros.
- Use a short Thai name in "name" when the dish is Thai; otherwise use a common English name.
- "calories" is kcal for the whole visible portion.
- "protein", "carbs" and "fat" are grams for the whole visible portion.
- "confidence" is a number from 0 to 1. Use a low value when the photo is unclear or the portion is hard to judge.
- Never invent brand names or ingredients you cannot see.
Return JSON only.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    isFood: { type: 'BOOLEAN' },
    name: { type: 'STRING' },
    calories: { type: 'NUMBER' },
    protein: { type: 'NUMBER' },
    carbs: { type: 'NUMBER' },
    fat: { type: 'NUMBER' },
    confidence: { type: 'NUMBER' },
  },
  required: ['isFood', 'name', 'calories', 'protein', 'carbs', 'fat'],
};

export function isAiConfigured(config?: AiSettings | null): boolean {
  return Boolean(config?.apiKey?.trim()) || Boolean(ENDPOINT);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

type ParseResult =
  | { ok: true; analysis: FoodAnalysis }
  | { ok: false; code: 'not_food' | 'invalid' };

export function parseAnalysis(payload: unknown): ParseResult {
  if (!payload || typeof payload !== 'object') return { ok: false, code: 'invalid' };
  const data = payload as Record<string, unknown>;
  if (data.isFood === false) return { ok: false, code: 'not_food' };
  if (typeof data.name !== 'string' || !data.name.trim()) return { ok: false, code: 'invalid' };
  const fields = ['calories', 'protein', 'carbs', 'fat'] as const;
  if (!fields.every((field) => isFiniteNumber(data[field]))) return { ok: false, code: 'invalid' };
  return {
    ok: true,
    analysis: {
      name: data.name.trim(),
      calories: Math.round(data.calories as number),
      protein: Math.round((data.protein as number) * 10) / 10,
      carbs: Math.round((data.carbs as number) * 10) / 10,
      fat: Math.round((data.fat as number) * 10) / 10,
      confidence: isFiniteNumber(data.confidence) ? (data.confidence as number) : undefined,
    },
  };
}

function mimeTypeFromUri(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(uri);
  switch (match?.[1]?.toLowerCase()) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
    case 'heif':
      return 'image/heic';
    default:
      return 'image/jpeg';
  }
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Hermes does not guarantee btoa, so encode the bytes ourselves. */
function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = index + 1 < bytes.length ? bytes[index + 1] : 0;
    const third = index + 2 < bytes.length ? bytes[index + 2] : 0;
    output += BASE64_ALPHABET[first >> 2];
    output += BASE64_ALPHABET[((first & 3) << 4) | (second >> 4)];
    output += index + 1 < bytes.length ? BASE64_ALPHABET[((second & 15) << 2) | (third >> 6)] : '=';
    output += index + 2 < bytes.length ? BASE64_ALPHABET[third & 63] : '=';
  }
  return output;
}

interface ImagePayload {
  base64: string;
  mimeType: string;
  size: number;
}

async function readImage(uri: string): Promise<ImagePayload> {
  if (Platform.OS !== 'web') {
    try {
      const { File } = await import('expo-file-system');
      const file = new File(uri);
      if (file.exists) {
        return {
          base64: await file.base64(),
          mimeType: file.type || mimeTypeFromUri(uri),
          size: file.size,
        };
      }
    } catch {
      // Fall back to fetch below (for example on an unsupported URI scheme).
    }
  }

  const response = await fetch(uri);
  if (!response.ok) throw new Error(`Could not read the photo (${response.status})`);
  const blob = await response.blob();
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return {
    base64: bytesToBase64(bytes),
    mimeType: blob.type || mimeTypeFromUri(uri),
    size: bytes.byteLength,
  };
}

function parseJsonText(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(unfenced);
  } catch {
    const start = unfenced.indexOf('{');
    const end = unfenced.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(unfenced.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function finish(text: string): FoodAnalysisResponse {
  const parsed = parseJsonText(text);
  if (parsed === null) {
    return { status: 'error', code: 'invalid', message: 'The AI returned a response that was not JSON' };
  }
  const result = parseAnalysis(parsed);
  if (!result.ok) {
    if (result.code === 'not_food') {
      return { status: 'error', code: 'not_food', message: 'No food was found in the photo' };
    }
    return { status: 'error', code: 'invalid', message: 'The AI returned an unexpected payload' };
  }
  return { status: 'ok', analysis: result.analysis };
}

function errorCodeForStatus(status: number, detail: string): FoodAnalysisErrorCode {
  if (/api key not valid|api_key_invalid|incorrect api key|invalid api key/i.test(detail)) {
    return 'auth';
  }
  if (status === 401 || status === 403) return 'auth';
  if (status === 429) return 'rate_limit';
  if (status === 400 || status === 404) return 'invalid';
  if (status >= 500) return 'network';
  return 'unknown';
}

/**
 * Provider errors sometimes echo (part of) the key. Never show it back.
 */
function redactSecrets(text: string): string {
  return text
    .replace(/AIza[0-9A-Za-z_-]{10,}/g, 'AIza…')
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, 'sk-…');
}

/**
 * Turns a provider error body into one readable line, for example
 * "API key not valid. Please pass a valid API key. (API_KEY_INVALID)".
 */
function summarizeDetail(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const parsed = JSON.parse(trimmed) as {
      error?: { message?: string; status?: string; details?: { reason?: string }[] };
      message?: string;
    };
    const error = parsed.error;
    if (error?.message) {
      const reason = error.details?.find((item) => item.reason)?.reason;
      return `${error.message}${reason ? ` (${reason})` : error.status ? ` (${error.status})` : ''}`;
    }
    if (typeof parsed.message === 'string') return parsed.message;
  } catch {
    // Not JSON: fall back to the raw text.
  }
  return trimmed;
}

async function httpError(response: Response): Promise<FoodAnalysisResponse> {
  let detail = '';
  try {
    detail = summarizeDetail(redactSecrets((await response.text()).slice(0, 600))).slice(0, 240);
  } catch {
    // The body is optional; the status still tells us what happened.
  }
  return {
    status: 'error',
    code: errorCodeForStatus(response.status, detail),
    message: `AI service responded with ${response.status}${detail ? `: ${detail}` : ''}`,
  };
}

async function callGemini(
  image: ImagePayload,
  apiKey: string,
  signal: AbortSignal,
): Promise<FoodAnalysisResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: image.mimeType, data: image.base64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
    signal,
  });

  if (!response.ok) return httpError(response);

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
  return finish(text);
}

async function callOpenAi(
  image: ImagePayload,
  apiKey: string,
  signal: AbortSignal,
): Promise<FoodAnalysisResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this meal photo.' },
            {
              type: 'image_url',
              image_url: { url: `data:${image.mimeType};base64,${image.base64}` },
            },
          ],
        },
      ],
    }),
    signal,
  });

  if (!response.ok) return httpError(response);

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return finish(payload.choices?.[0]?.message?.content ?? '');
}

async function analyzeWithProxy(imageUri: string, signal: AbortSignal): Promise<FoodAnalysisResponse> {
  if (!ENDPOINT) return { status: 'not_configured' };

  const imageResponse = await fetch(imageUri);
  const blob = await imageResponse.blob();

  const form = new FormData();
  if (Platform.OS === 'web') {
    form.append('image', blob, 'meal.jpg');
  } else {
    // React Native's FormData accepts this file shape.
    form.append('image', {
      uri: imageUri,
      name: 'meal.jpg',
      type: blob.type || 'image/jpeg',
    } as unknown as Blob);
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: form,
    signal,
  });

  if (!response.ok) return httpError(response);
  return finish(JSON.stringify(await response.json()));
}

async function analyzeWithProvider(
  imageUri: string,
  provider: AiProvider,
  apiKey: string,
  signal: AbortSignal,
): Promise<FoodAnalysisResponse> {
  const image = await readImage(imageUri);
  if (image.size > MAX_IMAGE_BYTES) {
    return {
      status: 'error',
      code: 'too_large',
      message: `The photo is ${Math.round(image.size / 1024 / 1024)} MB, which is too large`,
    };
  }
  return provider === 'gemini'
    ? callGemini(image, apiKey, signal)
    : callOpenAi(image, apiKey, signal);
}

/**
 * Sends a photo to the configured vision provider.
 *
 * IMPORTANT: this never fabricates a result. If no provider is configured the
 * caller receives `not_configured` and the UI must say so explicitly.
 */
export async function analyzeFoodImage(
  imageUri: string,
  config?: AiSettings | null,
): Promise<FoodAnalysisResponse> {
  const apiKey = config?.apiKey?.trim();
  if (!apiKey && !ENDPOINT) {
    return { status: 'not_configured' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    if (apiKey && config) {
      return await analyzeWithProvider(imageUri, config.provider, apiKey, controller.signal);
    }
    return await analyzeWithProxy(imageUri, controller.signal);
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return {
      status: 'error',
      code: 'network',
      message: aborted
        ? 'The AI request timed out'
        : error instanceof Error
          ? error.message
          : 'Unknown AI service error',
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Sends a tiny request so the user can verify a saved key before scanning.
 *
 * This reports the provider's own reason (redacted) instead of a generic
 * "invalid key" message, because Google also rejects keys whose project has
 * the Generative Language API disabled or referrer restrictions.
 */
export async function testAiConnection(config: AiSettings): Promise<AiTestResult> {
  const apiKey = config.apiKey.trim();
  if (!apiKey) return { status: 'error', code: 'auth', message: 'No API key saved' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const isGemini = config.provider === 'gemini';
    const response = await fetch(
      isGemini
        ? `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
        : 'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: isGemini
          ? {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            }
          : {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
        body: JSON.stringify(
          isGemini
            ? {
                contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
                generationConfig: { maxOutputTokens: 8, temperature: 0 },
              }
            : {
                model: OPENAI_MODEL,
                messages: [{ role: 'user', content: 'ping' }],
                max_tokens: 8,
              },
        ),
        signal: controller.signal,
      },
    );

    if (response.ok) return { status: 'ok' };

    let detail = '';
    try {
      detail = summarizeDetail(redactSecrets((await response.text()).slice(0, 600))).slice(0, 300);
    } catch {
      // Keep the status even when the body cannot be read.
    }
    return {
      status: 'error',
      code: errorCodeForStatus(response.status, detail),
      message: `HTTP ${response.status}${detail ? ` — ${detail}` : ''}`,
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return {
      status: 'error',
      code: 'network',
      message: aborted
        ? 'The request timed out'
        : error instanceof Error
          ? error.message
          : 'Unknown AI service error',
    };
  } finally {
    clearTimeout(timeout);
  }
}
