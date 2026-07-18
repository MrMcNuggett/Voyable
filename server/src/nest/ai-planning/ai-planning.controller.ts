import { Controller, HttpException, Param, Post, UseGuards } from '@nestjs/common';
import type { User } from '../../types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { HasActiveSubscriptionGuard } from '../subscription/has-active-subscription.guard';
import { db } from '../../db/database';
import { verifyTripAccess } from '../../services/tripAccess';
import { hasAiPlanningBudget, recordAiPlanningUsage } from './ai-planning-monthly-budget';
import { suggestPlaces } from './clients/anthropic-server.client';

interface TripRow {
  id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
}

/**
 * /api/trips/:tripId/ai-planning — AI-generated place suggestions for a trip
 * (#ai-planning), gated on subscription entitlement + a monthly usage cap.
 */
@Controller('api/trips/:tripId/ai-planning')
@UseGuards(JwtAuthGuard, HasActiveSubscriptionGuard)
export class AiPlanningController {
  @Post('suggest')
  async suggest(@CurrentUser() user: User, @Param('tripId') tripId: string) {
    if (!verifyTripAccess(tripId, user.id)) throw new HttpException({ error: 'not_found' }, 404);
    const trip = db.prepare('SELECT id, title, start_date, end_date FROM trips WHERE id = ?').get(tripId) as TripRow | undefined;
    if (!trip) throw new HttpException({ error: 'not_found' }, 404);

    if (!hasAiPlanningBudget(user.id)) {
      throw new HttpException({ error: 'monthly_limit_reached' }, 429);
    }

    const existingPlaceNames = (db.prepare('SELECT name FROM places WHERE trip_id = ?').all(trip.id) as { name: string }[]).map(p => p.name);

    let suggestions;
    try {
      suggestions = await suggestPlaces({
        tripTitle: trip.title,
        startDate: trip.start_date,
        endDate: trip.end_date,
        existingPlaceNames,
      });
    } catch (err) {
      console.error('[AI planning] suggestion failed:', err instanceof Error ? err.message : err);
      throw new HttpException({ error: 'suggestion_failed' }, 502);
    }

    db.prepare('INSERT INTO ai_planning_usage (user_id, trip_id) VALUES (?, ?)').run(user.id, trip.id);
    recordAiPlanningUsage(user.id);

    return { suggestions };
  }
}
