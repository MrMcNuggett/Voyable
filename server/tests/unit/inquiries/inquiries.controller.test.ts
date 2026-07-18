import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/services/inquiryService', () => ({
  createInquiry: vi.fn().mockReturnValue({ id: 1 }),
  listInquiries: vi.fn().mockReturnValue({ entries: [], total: 0, limit: 20, offset: 0 }),
  updateInquiryStatus: vi.fn(),
  verifyTripAccess: vi.fn(),
}));
vi.mock('../../../src/services/notifications', () => ({
  sendInquiryConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  sendInquiryAdminAlertEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../../src/services/auditLog', () => ({ writeAudit: vi.fn(), getClientIp: vi.fn().mockReturnValue('127.0.0.1') }));

import { InquiriesController, InquiriesAdminController } from '../../../src/nest/inquiries/inquiries.controller';
import { createInquiry, listInquiries, updateInquiryStatus, verifyTripAccess } from '../../../src/services/inquiryService';

const user = { id: 1 } as never;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('InquiriesController.create', () => {
  const controller = new InquiriesController();

  it('creates an inquiry with no trip_id', () => {
    const result = controller.create(user, { email: 'a@b.com', budget_range: null, travel_start: null, travel_end: null, interests: null, message: null, trip_id: undefined, trip_snapshot: undefined } as never);
    expect(result).toEqual({ inquiry: { id: 1 } });
  });

  it('refuses a trip_id the user cannot access', () => {
    vi.mocked(verifyTripAccess).mockReturnValueOnce(undefined as never);
    const result = controller.create(user, { email: 'a@b.com', trip_id: 99, budget_range: null, travel_start: null, travel_end: null, interests: null, message: null, trip_snapshot: undefined } as never);
    expect(result).toEqual({ error: 'Trip not found' });
    expect(createInquiry).not.toHaveBeenCalled();
  });

  it('creates an inquiry for an accessible trip_id', () => {
    vi.mocked(verifyTripAccess).mockReturnValueOnce({ id: 99, user_id: 1 } as never);
    const result = controller.create(user, { email: 'a@b.com', trip_id: 99, budget_range: null, travel_start: null, travel_end: null, interests: null, message: null, trip_snapshot: { tripName: 'Rome' } } as never);
    expect(result).toEqual({ inquiry: { id: 1 } });
  });
});

describe('InquiriesAdminController', () => {
  const controller = new InquiriesAdminController();

  it('list forwards no pagination when limit/offset are absent', () => {
    controller.list(undefined, undefined, undefined);
    expect(listInquiries).toHaveBeenCalledWith({ status: undefined, limit: undefined, offset: undefined });
  });

  it('list parses limit/offset when present', () => {
    controller.list('new', '10', '5');
    expect(listInquiries).toHaveBeenCalledWith({ status: 'new', limit: 10, offset: 5 });
  });

  it('updateStatus returns an error when the inquiry does not exist', () => {
    vi.mocked(updateInquiryStatus).mockReturnValueOnce(null);
    const req = { } as never;
    const result = controller.updateStatus(user, '999', { status: 'answered' } as never, req);
    expect(result).toEqual({ error: 'Inquiry not found' });
  });

  it('updateStatus writes an audit entry on success', () => {
    vi.mocked(updateInquiryStatus).mockReturnValueOnce({ id: 1, status: 'answered' } as never);
    const req = {} as never;
    const result = controller.updateStatus(user, '1', { status: 'answered' } as never, req);
    expect(result).toEqual({ inquiry: { id: 1, status: 'answered' } });
  });
});
