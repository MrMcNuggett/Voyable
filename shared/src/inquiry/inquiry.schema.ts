import { z } from 'zod';

export const INQUIRY_STATUSES = ['new', 'answered', 'archived'] as const;
export const inquiryStatusSchema = z.enum(INQUIRY_STATUSES).catch('new').default('new');
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

/** Frozen trip vitals captured at submit time — immune to later trip edits/deletion. */
export const inquiryTripSnapshotSchema = z.object({
  tripName: z.string(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  travelerCount: z.number().optional(),
  placesSavedCount: z.number().optional(),
});
export type InquiryTripSnapshot = z.infer<typeof inquiryTripSnapshotSchema>;

/** Advisory-request inquiry as returned by the submit/admin-list/admin-detail endpoints. */
export const inquirySchema = z.object({
  id: z.number(),
  trip_id: z.number().nullable(),
  user_id: z.number().nullable(),
  trip_snapshot: inquiryTripSnapshotSchema.nullable(),
  budget_range: z.string().nullable(),
  travel_start: z.string().nullable(),
  travel_end: z.string().nullable(),
  interests: z.string().nullable(),
  message: z.string().nullable(),
  email: z.string(),
  status: inquiryStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  // Joined in for the admin list — the requester's username, when the inquiry
  // is tied to an account (guest/anonymous requests are not supported here,
  // the submitter is always the current authenticated user).
  requester_username: z.string().optional(),
});
export type Inquiry = z.infer<typeof inquirySchema>;

export const createInquiryRequestSchema = z.object({
  trip_id: z.number().optional(),
  trip_snapshot: inquiryTripSnapshotSchema.optional(),
  budget_range: z.string().max(60).optional(),
  travel_start: z.string().max(20).optional(),
  travel_end: z.string().max(20).optional(),
  interests: z.string().max(500).optional(),
  message: z.string().max(4000).optional(),
  email: z.string().trim().email(),
});
export type CreateInquiryRequest = z.infer<typeof createInquiryRequestSchema>;

export const updateInquiryStatusRequestSchema = z.object({
  status: z.enum(INQUIRY_STATUSES),
});
export type UpdateInquiryStatusRequest = z.infer<typeof updateInquiryStatusRequestSchema>;

export const inquiryListResponseSchema = z.object({
  entries: z.array(inquirySchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});
export type InquiryListResponse = z.infer<typeof inquiryListResponseSchema>;
