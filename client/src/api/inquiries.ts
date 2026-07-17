import apiClient from './client'
import type { AxiosResponse } from 'axios'
import type { CreateInquiryRequest, Inquiry, InquiryListResponse, InquiryStatus, UpdateInquiryStatusRequest } from '@trek/shared'

const base = '/inquiries'
const adminBase = '/admin/inquiries'

/** Axios calls for advisory-request inquiries (submit + admin review). */
export const inquiriesApi = {
  create: (body: CreateInquiryRequest): Promise<{ inquiry: Inquiry }> =>
    apiClient.post(base, body satisfies CreateInquiryRequest).then((r: AxiosResponse) => r.data),

  adminList: (params?: { status?: InquiryStatus; limit?: number; offset?: number }): Promise<InquiryListResponse> =>
    apiClient.get(adminBase, { params }).then((r: AxiosResponse) => r.data),

  adminUpdateStatus: (id: number, status: InquiryStatus): Promise<{ inquiry: Inquiry }> =>
    apiClient.patch(`${adminBase}/${id}/status`, { status } satisfies UpdateInquiryStatusRequest).then((r: AxiosResponse) => r.data),
}
