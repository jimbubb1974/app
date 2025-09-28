export type Activity = {
  id: string;
  name: string;
  wbsPath?: string[];
  start: string; // ISO date string
  finish: string; // ISO date string
  durationDays?: number;
  totalFloatDays?: number;
  freeFloatDays?: number;
  isCritical?: boolean;
  percentComplete?: number;
  // Calculated schedule fields (from CPM re-calculation)
  calculatedStart?: string; // ISO
  calculatedFinish?: string; // ISO
  // Visual customization properties
  customColor?: string;
  customBarHeight?: number;
  customFontSize?: number;
  customFontFamily?: string;
  barStyle?:
    | "solid"
    | "dashed"
    | "dotted"
    | "rounded"
    | "barbell"
    | "sharp"
    | "pill";
  labelPosition?: "left" | "right" | "top" | "bottom" | "bar" | "none";
  // Relationship data (computed from relationships array)
  predecessors?: string[]; // Array of predecessor activity IDs
  successors?: string[]; // Array of successor activity IDs
  // Auto-layout optimization properties
  optimizedRow?: number; // Row position after optimization
  originalRow?: number; // Original row position before optimization
  rowChange?: number; // Change in row position (optimizedRow - originalRow)
  // Float path analysis
  floatPathNumber?: number; // Rank of activity's float path (1 = lowest total float)
};

export type Relationship = {
  predecessorId: string;
  successorId: string;
  type?: "FS" | "SS" | "FF" | "SF";
  lagDays?: number;
};

export type ProjectData = {
  projectName?: string;
  activities: Activity[];
  relationships?: Relationship[];
};

export type LoadStatus = "idle" | "loading" | "loaded" | "error";
