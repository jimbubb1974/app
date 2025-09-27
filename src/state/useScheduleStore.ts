import { create } from 'zustand';
import type { LoadStatus, ProjectData } from '../types/schedule';

type ScheduleState = {
  data: ProjectData | null;
  status: LoadStatus;
  error?: string;
  setData: (data: ProjectData) => void;
  setStatus: (s: LoadStatus) => void;
  setError: (e?: string) => void;
};

export const useScheduleStore = create<ScheduleState>((set) => ({
  data: null,
  status: 'idle',
  error: undefined,
  setData: (data) => set({ data }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
}));


