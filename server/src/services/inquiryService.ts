import { db } from '../db/database';
import type { InquiryStatus, InquiryTripSnapshot } from '@trek/shared';

export { verifyTripAccess } from './tripAccess';

interface InquiryRow {
  id: number;
  trip_id: number | null;
  user_id: number | null;
  trip_snapshot: string | null;
  budget_range: string | null;
  travel_start: string | null;
  travel_end: string | null;
  interests: string | null;
  message: string | null;
  email: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  requester_username?: string;
}

export interface InquiryDto extends Omit<InquiryRow, 'trip_snapshot'> {
  trip_snapshot: InquiryTripSnapshot | null;
}

function toDto(row: InquiryRow): InquiryDto {
  let snapshot: InquiryTripSnapshot | null = null;
  if (row.trip_snapshot) {
    try { snapshot = JSON.parse(row.trip_snapshot) as InquiryTripSnapshot; }
    catch { snapshot = null; }
  }
  return { ...row, trip_snapshot: snapshot };
}

export interface CreateInquiryInput {
  userId: number;
  tripId?: number;
  tripSnapshot?: InquiryTripSnapshot;
  budgetRange?: string;
  travelStart?: string;
  travelEnd?: string;
  interests?: string;
  message?: string;
  email: string;
}

export function createInquiry(input: CreateInquiryInput): InquiryDto {
  const result = db.prepare(`
    INSERT INTO inquiries (trip_id, user_id, trip_snapshot, budget_range, travel_start, travel_end, interests, message, email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.tripId ?? null,
    input.userId,
    input.tripSnapshot ? JSON.stringify(input.tripSnapshot) : null,
    input.budgetRange ?? null,
    input.travelStart ?? null,
    input.travelEnd ?? null,
    input.interests ?? null,
    input.message ?? null,
    input.email,
  );
  return getInquiry(Number(result.lastInsertRowid))!;
}

export function getInquiry(id: number): InquiryDto | null {
  const row = db.prepare(`
    SELECT i.*, u.username as requester_username
    FROM inquiries i
    LEFT JOIN users u ON u.id = i.user_id
    WHERE i.id = ?
  `).get(id) as InquiryRow | undefined;
  return row ? toDto(row) : null;
}

export function listInquiries(query: { status?: string; limit?: number; offset?: number }): { entries: InquiryDto[]; total: number; limit: number; offset: number } {
  const limit = Math.min(Math.max(query.limit ?? 100, 1), 500);
  const offset = Math.max(query.offset ?? 0, 0);
  const statusFilter = query.status && ['new', 'answered', 'archived'].includes(query.status) ? query.status : null;

  const rows = db.prepare(`
    SELECT i.*, u.username as requester_username
    FROM inquiries i
    LEFT JOIN users u ON u.id = i.user_id
    ${statusFilter ? 'WHERE i.status = ?' : ''}
    ORDER BY i.id DESC
    LIMIT ? OFFSET ?
  `).all(...(statusFilter ? [statusFilter, limit, offset] : [limit, offset])) as InquiryRow[];

  const total = statusFilter
    ? (db.prepare('SELECT COUNT(*) as c FROM inquiries WHERE status = ?').get(statusFilter) as { c: number }).c
    : (db.prepare('SELECT COUNT(*) as c FROM inquiries').get() as { c: number }).c;

  return { entries: rows.map(toDto), total, limit, offset };
}

export function updateInquiryStatus(id: number, status: InquiryStatus): InquiryDto | null {
  const result = db.prepare("UPDATE inquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, id);
  if (result.changes === 0) return null;
  return getInquiry(id);
}
