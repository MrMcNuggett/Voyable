import apiClient from './client'
import type { AxiosResponse } from 'axios'
import type { AiPlanningSuggestResponse } from '@trek/shared'

/** Axios calls for the AI planning add-on's place-suggestion endpoint. */
export const aiSuggestionsApi = {
  suggest: (tripId: number | string): Promise<AiPlanningSuggestResponse> =>
    apiClient.post(`/trips/${tripId}/ai-planning/suggest`).then((r: AxiosResponse) => r.data),
}
