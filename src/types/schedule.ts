export type Activity = {
  id: string;
  name: string;
  wbsPath?: string[];
  start: string; // ISO date string
  finish: string; // ISO date string
  durationDays?: number;
  totalFloatDays?: number;
  isCritical?: boolean;
  percentComplete?: number;
  // Visual customization properties
  customColor?: string;
  customBarHeight?: number;
  customFontSize?: number;
  customFontFamily?: string;
  barStyle?: "solid" | "dashed" | "dotted";
  showLabel?: boolean;
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
