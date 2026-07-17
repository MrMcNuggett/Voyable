import { create } from 'zustand'
import { subscriptionApi } from '../api/subscription'
import type { AiPlanningStatus } from '@trek/shared'

interface SubscriptionState {
  aiPlanningStatus: AiPlanningStatus
  loaded: boolean
  load: () => Promise<void>
  isAiPlanningEntitled: () => boolean
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  aiPlanningStatus: 'none',
  loaded: false,

  load: async () => {
    try {
      const data = await subscriptionApi.status()
      set({ aiPlanningStatus: data.ai_planning_status, loaded: true })
    } catch {
      set({ loaded: true })
    }
  },

  isAiPlanningEntitled: () => get().aiPlanningStatus === 'active',
}))
