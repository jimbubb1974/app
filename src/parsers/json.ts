import type { ProjectData } from '../types/schedule';

export async function parseJson(file: File): Promise<ProjectData> {
  const text = await file.text();
  const data = JSON.parse(text);
  // Expect shape to match ProjectData, but tolerate a top-level { activities: [] } minimal form.
  if (Array.isArray(data)) {
    return { projectName: undefined, activities: data };
  }
  if (!data.activities) {
    return { projectName: data.projectName, activities: [] };
  }
  return data as ProjectData;
}


