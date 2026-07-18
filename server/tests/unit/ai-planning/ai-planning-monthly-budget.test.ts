import { describe, it, expect, vi, beforeEach } from 'vitest';

const { testDb, dbMock } = vi.hoisted(() => {
  const Database = require('better-sqlite3');
  const db = new Database(':memory:');
  const mock = { db, closeDb: () => {}, reinitialize: () => {} };
  return { testDb: db, dbMock: mock };
});

vi.mock('../../../src/db/database', () => dbMock);

import { createTables } from '../../../src/db/schema';
import { runMigrations } from '../../../src/db/migrations';
import { createUser } from '../../helpers/factories';
import { envCap, hasAiPlanningBudget, recordAiPlanningUsage } from '../../../src/nest/ai-planning/ai-planning-monthly-budget';

createTables(testDb);
runMigrations(testDb);

describe('envCap', () => {
  it('returns the default when the env var is unset', () => {
    delete process.env.TEST_CAP_VAR;
    expect(envCap('TEST_CAP_VAR', 42)).toBe(42);
  });

  it('returns the default when the env var is an empty string', () => {
    process.env.TEST_CAP_VAR = '  ';
    expect(envCap('TEST_CAP_VAR', 42)).toBe(42);
    delete process.env.TEST_CAP_VAR;
  });

  it('parses a valid positive number, flooring it', () => {
    process.env.TEST_CAP_VAR = '10.9';
    expect(envCap('TEST_CAP_VAR', 42)).toBe(10);
    delete process.env.TEST_CAP_VAR;
  });

  it('returns the default for a non-numeric value', () => {
    process.env.TEST_CAP_VAR = 'not-a-number';
    expect(envCap('TEST_CAP_VAR', 42)).toBe(42);
    delete process.env.TEST_CAP_VAR;
  });

  it('returns the default for a negative number', () => {
    process.env.TEST_CAP_VAR = '-5';
    expect(envCap('TEST_CAP_VAR', 42)).toBe(42);
    delete process.env.TEST_CAP_VAR;
  });
});

describe('hasAiPlanningBudget / recordAiPlanningUsage', () => {
  beforeEach(() => {
    testDb.exec('DELETE FROM ai_planning_usage');
    testDb.exec('DELETE FROM users');
  });

  it('has budget with zero usage, and running out after reaching the cap', () => {
    const { user } = createUser(testDb);
    const now = Date.parse('2026-07-18T12:00:00Z');
    expect(hasAiPlanningBudget(user.id, now)).toBe(true);
    for (let i = 0; i < 60; i++) recordAiPlanningUsage(user.id, now);
    expect(hasAiPlanningBudget(user.id, now)).toBe(false);
  });

  it('seeds the count from the ai_planning_usage ledger on first use, and resets on a new calendar month', () => {
    const { user } = createUser(testDb);
    const june = Date.parse('2026-06-15T00:00:00Z');
    testDb.prepare('INSERT INTO ai_planning_usage (user_id, trip_id, created_at) VALUES (?, NULL, ?)').run(user.id, new Date(june).toISOString());

    expect(hasAiPlanningBudget(user.id, june)).toBe(true);

    const july = Date.parse('2026-07-15T00:00:00Z');
    expect(hasAiPlanningBudget(user.id, july)).toBe(true);
  });
});
