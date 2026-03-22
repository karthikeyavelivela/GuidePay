import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_CLAIM, MOCK_PAYOUTS } from '../services/mockData'

export const useClaimStore = create(
  persist(
    (set) => ({
      claims: [],
      payouts: MOCK_PAYOUTS,
      activeClaim: MOCK_CLAIM,

      setClaims: (claims) => set({ claims }),
      setActiveClaim: (claim) => set({ activeClaim: claim }),
      addPayout: (payout) => set((state) => ({ payouts: [payout, ...state.payouts] })),
    }),
    { name: 'gp-claims' }
  )
)
