import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '../../types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { writeAudit, getClientIp } from '../../services/auditLog';
import { createInquiryRequestSchema, updateInquiryStatusRequestSchema, type CreateInquiryRequest, type UpdateInquiryStatusRequest } from '@trek/shared';
import { createInquiry, listInquiries, updateInquiryStatus, verifyTripAccess } from '../../services/inquiryService';
import { sendInquiryConfirmationEmail, sendInquiryAdminAlertEmail } from '../../services/notifications';

/**
 * /api/inquiries — advisory-request submission (#advisory item 2), reused
 * both from the global "Request advisory" nav button (no trip) and the
 * per-trip entry points (trip attached, snapshot frozen at submit time).
 */
@Controller('api/inquiries')
@UseGuards(JwtAuthGuard)
export class InquiriesController {
  @Post()
  create(@CurrentUser() user: User, @Body(new ZodValidationPipe(createInquiryRequestSchema)) body: CreateInquiryRequest) {
    // A trip_id must belong to the submitting user (owner or member) — refuse
    // silently swapping in someone else's trip snapshot.
    if (body.trip_id && !verifyTripAccess(body.trip_id, user.id)) {
      return { error: 'Trip not found' };
    }
    const inquiry = createInquiry({
      userId: user.id,
      tripId: body.trip_id,
      tripSnapshot: body.trip_snapshot,
      budgetRange: body.budget_range,
      travelStart: body.travel_start,
      travelEnd: body.travel_end,
      interests: body.interests,
      message: body.message,
      email: body.email,
    });

    // Fire-and-forget — never let mail delivery block the response.
    const tripName = body.trip_snapshot?.tripName;
    void sendInquiryConfirmationEmail(body.email, user.id, tripName);
    void sendInquiryAdminAlertEmail({ id: inquiry.id, email: body.email, tripName });

    return { inquiry };
  }
}

/**
 * /api/admin/inquiries — admin review queue (#advisory item 6).
 */
@Controller('api/admin/inquiries')
@UseGuards(JwtAuthGuard, AdminGuard)
export class InquiriesAdminController {
  @Get()
  list(@Query('status') status: string | undefined, @Query('limit') limit: string | undefined, @Query('offset') offset: string | undefined) {
    return listInquiries({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateInquiryStatusRequestSchema)) body: UpdateInquiryStatusRequest,
    @Req() req: Request,
  ) {
    const inquiry = updateInquiryStatus(Number(id), body.status);
    if (!inquiry) return { error: 'Inquiry not found' };
    writeAudit({ userId: user.id, action: 'admin.inquiry_status_update', resource: `inquiry:${id}`, ip: getClientIp(req), details: { status: body.status } });
    return { inquiry };
  }
}
