// Minimal XER parser stub for Tier 1.
// For now, this attempts to detect a text-based XER and extract a tiny subset.
// Later tiers can replace with a proper parser that handles all tables.

import type { ProjectData, Activity, Relationship } from "../types/schedule";
import { computeActivityRelationships } from "../utils/relationships";

export async function parseXer(file: File): Promise<ProjectData> {
  const text = await file.text();

  // Quick heuristic: XER files often include table sections like "%T" and data rows "%R".
  // We'll parse ACTV and TASK table basics if present; otherwise, fallback to empty data.
  const lines = text.split(/\r?\n/);
  const activities: Activity[] = [];

  // Very naive section-based parse: capture ACTV/TASK-like rows if found.
  // In many XER exports, TASK table contains activity details.
  let headers: string[] | null = null;
  let currentTable = "";
  const relationships: Relationship[] = [];

  for (const line of lines) {
    if (line.startsWith("%T")) {
      // Table header - determine which table we're parsing
      if (line.includes("TASKPRED")) {
        currentTable = "TASKPRED";
        headers = null;
      } else if (line.includes("TASK")) {
        currentTable = "TASK";
        headers = null;
      } else {
        currentTable = "";
        headers = null;
      }
    } else if (line.startsWith("%F") && headers === null) {
      headers = line.substring(3).split("\t");
    } else if (line.startsWith("%R") && headers && currentTable === "TASK") {
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

      // Extract float values for critical path analysis
      const totalFloatHours = row["total_float_hr_cnt"]
        ? parseFloat(row["total_float_hr_cnt"])
        : undefined;
      const totalFloatDays =
        totalFloatHours !== undefined ? totalFloatHours / 8 : undefined; // Convert hours to days (assuming 8-hour workday)

      // Determine if activity is critical (total float <= 0)
      const isCritical = totalFloatDays !== undefined && totalFloatDays <= 0;

      if (id && start && finish) {
        activities.push({
          id,
          name,
          start,
          finish,
          totalFloatDays,
          isCritical,
        });
      }
    } else if (
      line.startsWith("%R") &&
      headers &&
      currentTable === "TASKPRED"
    ) {
      const values = line.substring(3).split("\t");
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i];
      });

      // Extract relationship data
      const predecessorId = row["pred_task_id"] || row["predecessor_id"];
      const successorId = row["task_id"] || row["successor_id"];
      const type =
        row["pred_type"] ||
        row["relationship_type"] ||
        row["logic_type"] ||
        "FS";
      const lagDays = row["lag_hr_cnt"]
        ? parseFloat(row["lag_hr_cnt"]) / 8 // Convert hours to days
        : row["lag"]
          ? parseFloat(row["lag"])
          : 0;

      if (predecessorId && successorId) {
        relationships.push({
          predecessorId,
          successorId,
          type: type as "FS" | "SS" | "FF" | "SF",
          lagDays,
        });
      }
    }
  }

  // Compute predecessor/successor relationships
  const activitiesWithRelationships = computeActivityRelationships(
    activities,
    relationships
  );

  return {
    projectName: undefined,
    activities: activitiesWithRelationships,
    relationships,
  };
}

function cryptoRandomId(): string {
  // Lightweight unique id for fallback cases
  return "id_" + Math.random().toString(36).slice(2, 10);
}
