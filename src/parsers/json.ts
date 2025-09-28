import type { ProjectData } from "../types/schedule";
import { useScheduleStore } from "../state/useScheduleStore";
import { computeActivityRelationships } from "../utils/relationships";

export async function parseJson(file: File): Promise<ProjectData> {
  const text = await file.text();
  const data = JSON.parse(text);

  // Handle comprehensive JSON format with customizations
  if (data.activities && data.layout && data.visualSettings) {
    // This is a comprehensive JSON with customizations
    const store = useScheduleStore.getState();

    // Restore layout state
    if (data.layout.panels) {
      if (data.layout.panels.leftPanel) {
        store.setLeftOpen(data.layout.panels.leftPanel.open);
        store.setLeftWidth(data.layout.panels.leftPanel.width);
      }
      if (data.layout.panels.rightPanel) {
        store.setPropertiesOpen(data.layout.panels.rightPanel.open);
        store.setPropertiesWidth(data.layout.panels.rightPanel.width);
      }
    }

    // Restore timescale settings
    if (data.layout.timescale) {
      store.setTimescale(
        data.layout.timescale.top,
        data.layout.timescale.bottom
      );
    }

    // Restore view range
    if (data.layout.viewRange) {
      store.setViewRange(
        data.layout.viewRange.start,
        data.layout.viewRange.end
      );
    }

    // Restore visual settings
    if (data.visualSettings.global) {
      store.setSettings(data.visualSettings.global);
    }

    // Restore source file info
    if (data.sourceFile) {
      store.setSourceFile(data.sourceFile);
    }

    // Compute predecessor/successor relationships if relationships exist
    const activitiesWithRelationships = data.relationships
      ? computeActivityRelationships(data.activities, data.relationships)
      : data.activities;

    // Return the project data
    return {
      projectName: data.projectName,
      activities: activitiesWithRelationships,
      relationships: data.relationships,
    };
  }

  // Handle legacy JSON format
  if (Array.isArray(data)) {
    return { projectName: undefined, activities: data };
  }
  if (!data.activities) {
    return { projectName: data.projectName, activities: [] };
  }

  // Compute relationships if they exist
  const activitiesWithRelationships = data.relationships
    ? computeActivityRelationships(data.activities, data.relationships)
    : data.activities;

  return {
    projectName: data.projectName,
    activities: activitiesWithRelationships,
    relationships: data.relationships,
  };
}
