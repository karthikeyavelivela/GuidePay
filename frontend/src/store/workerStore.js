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
      activePolicy: false,
      detectedCity: null,
      profileBg: 'plain',

      setPhone: (phone) => set({ phone }),

      setDetectedCity: (city) => set({ detectedCity: city }),

      login: (workerData) => set({
        worker: workerData || MOCK_WORKER,
        isAuthenticated: true,
      }),

      setOnboarded: (val = true) => set({ onboarded: val }),

      setActivePolicy: (val) => set({ activePolicy: val }),

      updateWorker: (data) => set((state) => ({
        worker: { ...state.worker, ...data },
      })),

      setProfileBg: (bg) => set({ profileBg: bg }),

      logout: () => set({
        worker: null,
        isAuthenticated: false,
        phone: '',
        onboarded: false,
        activePolicy: false,
        detectedCity: null,
        profileBg: 'plain',
      }),
    }),
    { name: 'gp-worker' }
  )
)
