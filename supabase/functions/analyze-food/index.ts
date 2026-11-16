// Reference implementation of the secure AI endpoint.
// Deploy with: supabase functions deploy analyze-food
// Secrets: supabase secrets set OPENAI_API_KEY=... AI_MODEL=gpt-4o-mini
//
// This function is intentionally NOT wired into the mobile app by default.
// Set EXPO_PUBLIC_AI_API_URL to the deployed function URL to enable scanning.
// The app never ships provider keys.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: 'unauthorized' }, 401);
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return json({ error: 'ai_not_configured' }, 503);
  }

  const form = await req.formData();
  const image = form.get('image');
  if (!(image instanceof File)) {
    return json({ error: 'image_required' }, 400);
  }
  if (image.size > 8 * 1024 * 1024) {
    return json({ error: 'image_too_large' }, 413);
  }

  const dataUrl = `data:${image.type || 'image/jpeg'};base64,${toBase64(
    new Uint8Array(await image.arrayBuffer()),
  )}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: Deno.env.get('AI_MODEL') ?? 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a nutrition estimator. Return JSON only with keys: name (string, Thai if possible), calories (number), protein (number), carbs (number), fat (number), confidence (number 0-1). Values are for the visible portion in the photo.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Estimate the nutrition of this meal.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    return json({ error: 'ai_provider_error' }, 502);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    return json({ error: 'ai_bad_response' }, 502);
  }

  try {
    const parsed = JSON.parse(content);
    if (typeof parsed.name !== 'string' || !parsed.name.trim()) {
      return json({ error: 'ai_bad_response' }, 502);
    }
    return json(parsed);
  } catch {
    return json({ error: 'ai_bad_response' }, 502);
  }
});
