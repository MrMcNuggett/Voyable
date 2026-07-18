import { safeFetchLlm } from '../../../utils/ssrfGuard';
import type { AiPlaceSuggestion } from '@trek/shared';

const TIMEOUT_MS = 60_000;
const MAX_TOKENS = 2048;
const ANTHROPIC_VERSION = '2023-06-01';
const TOOL_NAME = 'suggest_places';
const DEFAULT_MODEL = 'claude-sonnet-5';

export interface AiPlanningContext {
  tripTitle: string;
  startDate: string | null;
  endDate: string | null;
  existingPlaceNames: string[];
}

/**
 * Server-owned Anthropic Messages API client for the paid "AI planning" add-on.
 * Same forced-tool-use shape as llm-parse's AnthropicClient (raw fetch, no SDK,
 * routed through safeFetchLlm for SSRF protection), but reads a server-owned
 * ANTHROPIC_API_KEY directly rather than the per-user BYOK resolver — this
 * call is billed to Voyable, not the user, since it's gated on subscription
 * entitlement rather than a user-supplied key.
 */
export async function suggestPlaces(context: AiPlanningContext): Promise<AiPlaceSuggestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const url = 'https://api.anthropic.com/v1/messages';

  const tripWindow = context.startDate && context.endDate ? `${context.startDate} to ${context.endDate}` : 'dates not set';
  const existing = context.existingPlaceNames.length > 0 ? context.existingPlaceNames.join(', ') : 'none yet';
  const userText = `Trip: "${context.tripTitle}" (${tripWindow}). Places already planned: ${existing}. Suggest 3 to 5 additional places worth visiting on this trip that are not already in the list.`;

  const body = {
    model,
    max_tokens: MAX_TOKENS,
    system: 'You suggest travel places for a trip planner. Always respond only via the suggest_places tool. Each suggestion needs a concise reason (max 20 words). Never suggest a place already in the provided list.',
    tools: [
      {
        name: TOOL_NAME,
        description: 'Return suggested places to add to the trip.',
        input_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  reason: { type: 'string' },
                  category: { type: 'string' },
                },
                required: ['name', 'reason'],
              },
            },
          },
          required: ['suggestions'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: TOOL_NAME },
    messages: [{ role: 'user', content: userText }],
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await safeFetchLlm(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Anthropic request failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    stop_reason?: string;
    content?: { type: string; name?: string; input?: { suggestions?: unknown } }[];
  };
  if (data.stop_reason === 'refusal') return [];

  const toolUse = data.content?.find(b => b.type === 'tool_use' && b.name === TOOL_NAME);
  const suggestions = toolUse?.input?.suggestions;
  return Array.isArray(suggestions) ? (suggestions as AiPlaceSuggestion[]) : [];
}
