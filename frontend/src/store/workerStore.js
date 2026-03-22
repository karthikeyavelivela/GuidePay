import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_WORKER } from '../services/mockData'

export const useWorkerStore = create(
  persist(
    (set, get) => ({
      worker: null,
      isAuthenticated: false,
      phone: '',
      onboarded: false,
      detectedCity: null,
      profileBg: 'default',

      setPhone: (phone) => set({ phone }),

      setDetectedCity: (city) => set({ detectedCity: city }),

      login: (workerData) => set({
        worker: workerData || MOCK_WORKER,
        isAuthenticated: true,
      }),

      setOnboarded: () => set({ onboarded: true }),

      updateWorker: (data) => set((state) => ({
        worker: { ...state.worker, ...data },
      })),

      setProfileBg: (bg) => set({ profileBg: bg }),

      logout: () => set({
        worker: null,
        isAuthenticated: false,
        phone: '',
        onboarded: false,
        detectedCity: null,
        profileBg: 'default',
      }),
    }),
    { name: 'gp-worker' }
  )
)
