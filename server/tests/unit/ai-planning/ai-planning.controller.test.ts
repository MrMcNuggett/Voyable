import { describe, it, expect, vi } from 'vitest';

const { testDb, dbMock } = vi.hoisted(() => {
  const Database = require('better-sqlite3');
  const db = new Database(':memory:');
  const mock = { db, closeDb: () => {}, reinitialize: () => {} };
  return { testDb: db, dbMock: mock };
});

vi.mock('../../../src/db/database', () => dbMock);
vi.mock('../../../src/services/tripAccess', () => ({ verifyTripAccess: () => true }));
vi.mock('../../../src/nest/ai-planning/ai-planning-monthly-budget', () => ({
  hasAiPlanningBudget: vi.fn(),
  recordAiPlanningUsage: vi.fn(),
}));
vi.mock('../../../src/nest/ai-planning/clients/anthropic-server.client', () => ({
  suggestPlaces: vi.fn(),
}));

import { createTables } from '../../../src/db/schema';
import { runMigrations } from '../../../src/db/migrations';
import { createUser, createTrip } from '../../helpers/factories';
import { AiPlanningController } from '../../../src/nest/ai-planning/ai-planning.controller';
import { hasAiPlanningBudget } from '../../../src/nest/ai-planning/ai-planning-monthly-budget';
import { suggestPlaces } from '../../../src/nest/ai-planning/clients/anthropic-server.client';

createTables(testDb);
runMigrations(testDb);

describe('AiPlanningController.suggest', () => {
  const controller = new AiPlanningController();

  it('throws 429 monthly_limit_reached when the budget is exhausted', async () => {
    const { user } = createUser(testDb);
    const trip = createTrip(testDb, user.id);
    vi.mocked(hasAiPlanningBudget).mockReturnValueOnce(false);

    await expect(controller.suggest(user as never, String(trip.id))).rejects.toMatchObject({
      response: { error: 'monthly_limit_reached' },
      status: 429,
    });
  });

  it('throws 502 suggestion_failed when the Anthropic client throws', async () => {
    const { user } = createUser(testDb);
    const trip = createTrip(testDb, user.id);
    vi.mocked(hasAiPlanningBudget).mockReturnValueOnce(true);
    vi.mocked(suggestPlaces).mockRejectedValueOnce(new Error('boom'));

    await expect(controller.suggest(user as never, String(trip.id))).rejects.toMatchObject({
      response: { error: 'suggestion_failed' },
      status: 502,
    });
  });
});
