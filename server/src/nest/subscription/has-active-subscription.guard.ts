import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { db } from '../../db/database';

/**
 * Gates a route on `users.ai_planning_status === 'active'`. Must run after
 * JwtAuthGuard (`@UseGuards(JwtAuthGuard, HasActiveSubscriptionGuard)`) so
 * `req.user` is already populated.
 *
 * Looks up the status directly rather than trusting `req.user` because
 * `@CurrentUser()`/JwtAuthGuard carry the narrow projection
 * `verifyJwtAndLoadUser` selects (id/username/email/role/password_version) —
 * several test harnesses stand up their own minimal `users` table against
 * that exact shape, so widening that shared SELECT would break them (see the
 * identical reasoning previously inline in ai-planning.controller.ts).
 */
@Injectable()
export class HasActiveSubscriptionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const status = (
      db.prepare('SELECT ai_planning_status FROM users WHERE id = ?').get(req.user!.id) as { ai_planning_status: string } | undefined
    )?.ai_planning_status;
    if (status !== 'active') {
      throw new HttpException({ error: 'not_entitled' }, 403);
    }
    return true;
  }
}
