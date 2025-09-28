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
  // Timescale settings
  timescaleTop: "month" | "year";
  timescaleBottom: "week" | "month";
  timescaleOpen: boolean;
  rangeOpen: boolean;
  exportOpen: boolean;
  settingsOpen: boolean;
  settings: {
    activitySpacing: number;
    fontSize: number;
    fontFamily: string;
    barHeight: number;
    defaultLabelPosition: "left" | "right" | "top" | "bottom" | "bar" | "none";
  };
  // Activity selection
  selectedActivityId: string | null;
  selectedActivityIds: string[]; // Multi-selection support
  // Source file tracking
  sourceFile: {
    type: "XER" | "JSON" | "unknown";
    filename: string;
    importedAt: string;
  } | null;
  // Export settings
  exportPath: string;
  // Success notification
  successNotification: {
    open: boolean;
    message: string;
  };
  // Critical path settings
  criticalPathOpen: boolean;
  criticalPathSettings: {
    enabled: boolean;
    displayMethod: "color" | "outline";
    criticalColor: string;
    outlineColor: string;
    outlineWidth: number;
    criteria: "isCritical" | "totalFloat";
    floatThreshold: number;
  };
  timelineFormatOpen: boolean;
  timelineFormatSettings: {
    enabled: boolean;
    topTierFormat: "full" | "abbreviated" | "short" | "numeric" | "custom";
    bottomTierFormat: "full" | "abbreviated" | "short" | "numeric" | "custom";
    topTierCustomFormat: string;
    bottomTierCustomFormat: string;
  };
  logicLinesEnabled: boolean;
  // Filter and sort state
  filterOpen: boolean;
  sortOpen: boolean;
  filterSettings: {
    enabled: boolean;
    nameFilter: string;
    criticalOnly: boolean;
    dateRange: {
      enabled: boolean;
      startDate: string;
      endDate: string;
    };
  };
  sortSettings: {
    enabled: boolean;
    sortBy: "name" | "startDate" | "finishDate" | "duration" | "totalFloat";
    sortOrder: "asc" | "desc";
  };
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
  setTimescale: (top: "month" | "year", bottom: "week" | "month") => void;
  setTimescaleOpen: (open: boolean) => void;
  setRangeOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setSettings: (settings: {
    activitySpacing: number;
    fontSize: number;
    fontFamily: string;
    barHeight: number;
    defaultLabelPosition: "left" | "right" | "top" | "bottom" | "bar" | "none";
  }) => void;
  setSelectedActivity: (id: string | null) => void;
  setSelectedActivities: (ids: string[]) => void;
  toggleActivitySelection: (id: string) => void;
  updateActivityProperty: (
    id: string,
    property: keyof Activity,
    value: any
  ) => void;
  updateMultipleActivities: (
    ids: string[],
    property: keyof Activity,
    value: any
  ) => void;
  setSourceFile: (
    sourceFile: {
      type: "XER" | "JSON" | "unknown";
      filename: string;
      importedAt: string;
    } | null
  ) => void;
  setExportPath: (path: string) => void;
  setSuccessNotification: (notification: {
    open: boolean;
    message: string;
  }) => void;
  setCriticalPathOpen: (open: boolean) => void;
  setCriticalPathSettings: (settings: {
    enabled: boolean;
    displayMethod: "color" | "outline";
    criticalColor: string;
    outlineColor: string;
    outlineWidth: number;
    criteria: "isCritical" | "totalFloat";
    floatThreshold: number;
  }) => void;
  setTimelineFormatOpen: (open: boolean) => void;
  setTimelineFormatSettings: (settings: {
    enabled: boolean;
    topTierFormat: "full" | "abbreviated" | "short" | "numeric" | "custom";
    bottomTierFormat: "full" | "abbreviated" | "short" | "numeric" | "custom";
    topTierCustomFormat: string;
    bottomTierCustomFormat: string;
  }) => void;
  setLogicLinesEnabled: (enabled: boolean) => void;
  setFilterOpen: (open: boolean) => void;
  setSortOpen: (open: boolean) => void;
  setFilterSettings: (settings: {
    enabled: boolean;
    nameFilter: string;
    criticalOnly: boolean;
    dateRange: {
      enabled: boolean;
      startDate: string;
      endDate: string;
    };
  }) => void;
  setSortSettings: (settings: {
    enabled: boolean;
    sortBy: "name" | "startDate" | "finishDate" | "duration" | "totalFloat";
    sortOrder: "asc" | "desc";
  }) => void;
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
      timescaleTop: "month",
      timescaleBottom: "week",
      timescaleOpen: false,
      rangeOpen: false,
      exportOpen: false,
      settingsOpen: false,
      settings: {
        activitySpacing: 28,
        fontSize: 12,
        fontFamily: "Arial, sans-serif",
        barHeight: 20,
        defaultLabelPosition: "bar",
      },
      selectedActivityId: null,
      selectedActivityIds: [],
      sourceFile: null,
      exportPath: "./export",
      successNotification: { open: false, message: "" },
      criticalPathOpen: false,
      criticalPathSettings: {
        enabled: false,
        displayMethod: "color",
        criticalColor: "#e74c3c",
        outlineColor: "#e74c3c",
        outlineWidth: 3,
        criteria: "isCritical",
        floatThreshold: 0,
      },
      timelineFormatOpen: false,
      timelineFormatSettings: {
        enabled: false,
        topTierFormat: "abbreviated",
        bottomTierFormat: "short",
        topTierCustomFormat: "",
        bottomTierCustomFormat: "",
      },
      logicLinesEnabled: false,
      // Filter and sort initial state
      filterOpen: false,
      sortOpen: false,
      filterSettings: {
        enabled: false,
        nameFilter: "",
        criticalOnly: false,
        dateRange: {
          enabled: false,
          startDate: "",
          endDate: "",
        },
      },
      sortSettings: {
        enabled: false,
        sortBy: "name",
        sortOrder: "asc",
      },
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
      toggleProperties: () =>
        set((s) => ({ propertiesOpen: !s.propertiesOpen })),
      setPropertiesWidth: (width) =>
        set({
          propertiesWidth: Math.max(220, Math.min(560, Math.round(width))),
        }),
      setLeftOpen: (open) => set({ leftOpen: open }),
      toggleLeft: () => set((s) => ({ leftOpen: !s.leftOpen })),
      setLeftWidth: (width) =>
        set({ leftWidth: Math.max(200, Math.min(520, Math.round(width))) }),
      setTimescale: (top, bottom) =>
        set({
          timescaleTop: top,
          timescaleBottom: bottom,
        }),
      setTimescaleOpen: (open) => set({ timescaleOpen: open }),
      setRangeOpen: (open) => set({ rangeOpen: open }),
      setExportOpen: (open) => set({ exportOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setSettings: (settings) => set({ settings }),
      setSelectedActivity: (id) =>
        set({ selectedActivityId: id, selectedActivityIds: id ? [id] : [] }),
      setSelectedActivities: (ids) =>
        set({
          selectedActivityIds: ids,
          selectedActivityId: ids.length === 1 ? ids[0] : null,
        }),
      toggleActivitySelection: (id) => {
        const state = get();
        const currentIds = state.selectedActivityIds;
        const isSelected = currentIds.includes(id);

        if (isSelected) {
          // Remove from selection
          const newIds = currentIds.filter((selectedId) => selectedId !== id);
          set({
            selectedActivityIds: newIds,
            selectedActivityId: newIds.length === 1 ? newIds[0] : null,
          });
        } else {
          // Add to selection
          const newIds = [...currentIds, id];
          set({
            selectedActivityIds: newIds,
            selectedActivityId: newIds.length === 1 ? newIds[0] : null,
          });
        }
      },
      updateActivityProperty: (id, property, value) => {
        const state = get();
        if (!state.data) return;

        const updatedActivities = state.data.activities.map((activity) =>
          activity.id === id ? { ...activity, [property]: value } : activity
        );

        set({
          data: {
            ...state.data,
            activities: updatedActivities,
          },
        });
      },
      updateMultipleActivities: (ids, property, value) => {
        const state = get();
        if (!state.data) return;

        const updatedActivities = state.data.activities.map((activity) =>
          ids.includes(activity.id)
            ? { ...activity, [property]: value }
            : activity
        );

        set({
          data: {
            ...state.data,
            activities: updatedActivities,
          },
        });
      },
      setSourceFile: (sourceFile) => set({ sourceFile }),
      setExportPath: (path) => set({ exportPath: path }),
      setSuccessNotification: (notification) =>
        set({ successNotification: notification }),
      setCriticalPathOpen: (open) => set({ criticalPathOpen: open }),
      setCriticalPathSettings: (settings) =>
        set({ criticalPathSettings: settings }),
      setTimelineFormatOpen: (open) => set({ timelineFormatOpen: open }),
      setTimelineFormatSettings: (settings) =>
        set({ timelineFormatSettings: settings }),
      setLogicLinesEnabled: (enabled) => set({ logicLinesEnabled: enabled }),
      setFilterOpen: (open) => set({ filterOpen: open }),
      setSortOpen: (open) => set({ sortOpen: open }),
      setFilterSettings: (settings) => set({ filterSettings: settings }),
      setSortSettings: (settings) => set({ sortSettings: settings }),
    }),
    {
      name: "planworks-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        propertiesOpen: state.propertiesOpen,
        propertiesWidth: state.propertiesWidth,
        leftOpen: state.leftOpen,
        leftWidth: state.leftWidth,
        timescaleTop: state.timescaleTop,
        timescaleBottom: state.timescaleBottom,
        settings: state.settings,
        sourceFile: state.sourceFile,
        exportPath: state.exportPath,
        criticalPathSettings: state.criticalPathSettings,
        timelineFormatSettings: state.timelineFormatSettings,
        logicLinesEnabled: state.logicLinesEnabled,
        filterSettings: state.filterSettings,
        sortSettings: state.sortSettings,
      }),
    }
  )
);
