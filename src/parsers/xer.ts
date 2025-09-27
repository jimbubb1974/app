// Minimal XER parser stub for Tier 1.
// For now, this attempts to detect a text-based XER and extract a tiny subset.
// Later tiers can replace with a proper parser that handles all tables.

import type { ProjectData, Activity } from "../types/schedule";

export async function parseXer(file: File): Promise<ProjectData> {
  const text = await file.text();

  // Quick heuristic: XER files often include table sections like "%T" and data rows "%R".
  // We'll parse ACTV and TASK table basics if present; otherwise, fallback to empty data.
  const lines = text.split(/\r?\n/);
  const activities: Activity[] = [];

  // Very naive section-based parse: capture ACTV/TASK-like rows if found.
  // In many XER exports, TASK table contains activity details.
  let headers: string[] | null = null;
  for (const line of lines) {
    if (line.startsWith("%T") && line.includes("TASK")) {
      // Next header line typically starts with %F
      headers = null;
    } else if (line.startsWith("%F") && headers === null) {
      headers = line.substring(3).split("\t");
    } else if (line.startsWith("%R") && headers) {
      const values = line.substring(3).split("\t");
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i];
      });

      // Attempt to map common fields. Field names vary by export; we try several.
      const id =
        row["task_id"] ||
        row["act_id"] ||
        row["task_code"] ||
        row["task_id"] ||
        cryptoRandomId();
      const name =
        row["task_name"] || row["task_name"] || row["act_name"] || "Activity";
      const start =
        row["early_start_date"] ||
        row["start_date"] ||
        row["act_start_date"] ||
        "";
      const finish =
        row["early_end_date"] ||
        row["finish_date"] ||
        row["act_end_date"] ||
        "";

      if (id && start && finish) {
        activities.push({ id, name, start, finish });
      }
    }
  }

  return { projectName: undefined, activities };
}

function cryptoRandomId(): string {
  // Lightweight unique id for fallback cases
  return "id_" + Math.random().toString(36).slice(2, 10);
}
