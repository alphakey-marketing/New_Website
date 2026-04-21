/**
 * Shared OpenRouter API helper.
 * All AI API routes must import from here — never duplicate this logic.
 */

interface CallOptions {
  temperature?: number;
  max_tokens?: number;
}

/**
 * Call the OpenRouter chat completion API.
 * - Automatically strips markdown code fences from the response.
 * - Throws a descriptive Error on HTTP failures.
 */
export async function callOpenRouter(
  systemPrompt: string,
  userMessage: string,
  options: CallOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set in environment variables.');

  const { temperature = 0.2, max_tokens = 2048 } = options;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://alphakey-marketing.replit.app',
      'X-Title': 'AlphaKey Task Assistant',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-small-3.1-24b-instruct',
      temperature,
      max_tokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? '{}';

  // Strip markdown code fences the model sometimes wraps around JSON
  return content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

/**
 * Safe JSON parser with two-stage fallback:
 *   1. Direct JSON.parse
 *   2. Extract first JSON array  [ { ... } ]
 *   3. Extract first JSON object { ... }
 *   4. Return fallback if provided, otherwise throw
 */
export function safeParseJSON<T>(raw: string, fallback?: T): T {
  // Stage 1: direct parse
  try {
    return JSON.parse(raw) as T;
  } catch { /* fall through */ }

  // Stage 2: pull out a JSON array
  const arrayMatch = raw.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (arrayMatch) {
    try { return JSON.parse(arrayMatch[0]) as T; } catch { /* fall through */ }
  }

  // Stage 3: pull out the first JSON object (handles "Here is the result: {...}")
  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try { return JSON.parse(objectMatch[0]) as T; } catch { /* fall through */ }
  }

  if (fallback !== undefined) return fallback;
  throw new Error(`Failed to parse AI response as JSON. Raw: ${raw.slice(0, 200)}`);
}
