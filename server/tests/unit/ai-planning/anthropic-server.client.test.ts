import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { safeFetchLlmMock } = vi.hoisted(() => ({ safeFetchLlmMock: vi.fn() }));
vi.mock('../../../src/utils/ssrfGuard', () => ({ safeFetchLlm: safeFetchLlmMock }));

import { suggestPlaces } from '../../../src/nest/ai-planning/clients/anthropic-server.client';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe('suggestPlaces', () => {
  const context = { tripTitle: 'Rome trip', startDate: '2026-08-01', endDate: '2026-08-05', existingPlaceNames: ['Colosseum'] };

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    safeFetchLlmMock.mockClear();
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_MODEL;
    vi.restoreAllMocks();
  });

  it('throws when ANTHROPIC_API_KEY is not configured', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    await expect(suggestPlaces(context)).rejects.toThrow('ANTHROPIC_API_KEY is not configured');
  });

  it('returns the suggestions from a successful tool_use response', async () => {
    const suggestions = [{ name: 'Trevi Fountain', reason: 'Iconic', category: 'Attraction' }];
    safeFetchLlmMock.mockResolvedValueOnce(jsonResponse({
      stop_reason: 'tool_use',
      content: [{ type: 'tool_use', name: 'suggest_places', input: { suggestions } }],
    }));
    await expect(suggestPlaces(context)).resolves.toEqual(suggestions);
  });

  it('uses ANTHROPIC_MODEL override when set', async () => {
    process.env.ANTHROPIC_MODEL = 'claude-custom';
    safeFetchLlmMock.mockResolvedValueOnce(jsonResponse({ content: [] }));
    await suggestPlaces(context);
    const body = JSON.parse(safeFetchLlmMock.mock.calls[0][1].body);
    expect(body.model).toBe('claude-custom');
  });

  it('handles no startDate/endDate and an empty existingPlaceNames list', async () => {
    safeFetchLlmMock.mockResolvedValueOnce(jsonResponse({ content: [] }));
    await suggestPlaces({ tripTitle: 'Mystery trip', startDate: null, endDate: null, existingPlaceNames: [] });
    const body = JSON.parse(safeFetchLlmMock.mock.calls[0][1].body);
    expect(body.messages[0].content).toContain('dates not set');
    expect(body.messages[0].content).toContain('none yet');
  });

  it('returns an empty array when the model refuses', async () => {
    safeFetchLlmMock.mockResolvedValueOnce(jsonResponse({ stop_reason: 'refusal', content: [] }));
    await expect(suggestPlaces(context)).resolves.toEqual([]);
  });

  it('returns an empty array when no tool_use block is present', async () => {
    safeFetchLlmMock.mockResolvedValueOnce(jsonResponse({ content: [{ type: 'text', name: undefined }] }));
    await expect(suggestPlaces(context)).resolves.toEqual([]);
  });

  it('returns an empty array when suggestions is not an array', async () => {
    safeFetchLlmMock.mockResolvedValueOnce(jsonResponse({
      content: [{ type: 'tool_use', name: 'suggest_places', input: { suggestions: 'not-an-array' } }],
    }));
    await expect(suggestPlaces(context)).resolves.toEqual([]);
  });

  it('throws with response detail when the Anthropic request fails', async () => {
    safeFetchLlmMock.mockResolvedValueOnce(jsonResponse({ error: 'rate limited' }, false, 429));
    await expect(suggestPlaces(context)).rejects.toThrow(/Anthropic request failed \(429\)/);
  });
});
