export type Activity = {
  id: string;
  name: string;
  start: string;
  finish: string;
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
