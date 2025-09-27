import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LoadStatus, ProjectData } from "../types/schedule";

type ScheduleState = {
  data: ProjectData | null;
  status: LoadStatus;
  error?: string;
  // Data extents and current view window (ms since epoch)
  dataMin?: number;
  dataMax?: number;
  viewStart?: number;
  viewEnd?: number;
  // UI state
  propertiesOpen: boolean;
  propertiesWidth: number; // px
  leftOpen: boolean;
  leftWidth: number; // px
  // Setters
  setData: (data: ProjectData) => void;
  setStatus: (s: LoadStatus) => void;
  setError: (e?: string) => void;
  setExtents: (min?: number, max?: number) => void;
  setViewRange: (start?: number, end?: number) => void;
  fitAll: () => void;
  zoom: (factor: number) => void; // <1 zoom in, >1 zoom out
  panMs: (deltaMs: number) => void;
  setPropertiesOpen: (open: boolean) => void;
  toggleProperties: () => void;
  setPropertiesWidth: (width: number) => void;
  setLeftOpen: (open: boolean) => void;
  toggleLeft: () => void;
  setLeftWidth: (width: number) => void;
};

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
  data: null,
  status: "idle",
  error: undefined,
  dataMin: undefined,
  dataMax: undefined,
  viewStart: undefined,
  viewEnd: undefined,
  propertiesOpen: true,
  propertiesWidth: 300,
  leftOpen: true,
  leftWidth: 280,
  setData: (data) => set({ data }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setExtents: (min, max) => set({ dataMin: min, dataMax: max }),
  setViewRange: (start, end) => set({ viewStart: start, viewEnd: end }),
  fitAll: () => {
    const { dataMin, dataMax } = get();
    if (dataMin !== undefined && dataMax !== undefined) {
      set({ viewStart: dataMin, viewEnd: dataMax });
    }
  },
  zoom: (factor) => {
    const { viewStart, viewEnd } = get();
    if (viewStart === undefined || viewEnd === undefined) return;
    const center = (viewStart + viewEnd) / 2;
    const half = ((viewEnd - viewStart) / 2) * factor;
    set({ viewStart: center - half, viewEnd: center + half });
  },
  panMs: (deltaMs) => {
    const { viewStart, viewEnd } = get();
    if (viewStart === undefined || viewEnd === undefined) return;
    set({ viewStart: viewStart + deltaMs, viewEnd: viewEnd + deltaMs });
  },
  setPropertiesOpen: (open) => set({ propertiesOpen: open }),
  toggleProperties: () => set((s) => ({ propertiesOpen: !s.propertiesOpen })),
  setPropertiesWidth: (width) =>
    set({ propertiesWidth: Math.max(220, Math.min(560, Math.round(width))) }),
  setLeftOpen: (open) => set({ leftOpen: open }),
  toggleLeft: () => set((s) => ({ leftOpen: !s.leftOpen })),
  setLeftWidth: (width) =>
    set({ leftWidth: Math.max(200, Math.min(520, Math.round(width))) }),
    }),
    {
      name: "planworks-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        propertiesOpen: state.propertiesOpen,
        propertiesWidth: state.propertiesWidth,
        leftOpen: state.leftOpen,
        leftWidth: state.leftWidth,
      }),
    }
  )
);
