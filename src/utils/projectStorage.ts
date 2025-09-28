import localforage from "localforage";
import type { ProjectData } from "../types/schedule";

const PROJECTS_DB = localforage.createInstance({
  name: "PlanWorks",
  storeName: "projects",
  description: "Saved PlanWorks projects",
});

const INDEX_KEY = "__project_index__";

export type ProjectMeta = {
  name: string;
  savedAt: string; // ISO
};

async function readIndex(): Promise<ProjectMeta[]> {
  const idx = (await PROJECTS_DB.getItem<ProjectMeta[]>(INDEX_KEY)) || [];
  return Array.isArray(idx) ? idx : [];
}

async function writeIndex(index: ProjectMeta[]) {
  await PROJECTS_DB.setItem(INDEX_KEY, index);
}

export async function saveProject(
  name: string,
  data: ProjectData
): Promise<void> {
  const key = `project:${name}`;
  await PROJECTS_DB.setItem<ProjectData>(key, data);
  const index = await readIndex();
  const now = new Date().toISOString();
  const existing = index.find((i) => i.name === name);
  if (existing) existing.savedAt = now;
  else index.push({ name, savedAt: now });
  await writeIndex(index);
}

export async function loadProject(name: string): Promise<ProjectData | null> {
  const key = `project:${name}`;
  const data = await PROJECTS_DB.getItem<ProjectData>(key);
  return data ?? null;
}

export async function deleteProject(name: string): Promise<void> {
  const key = `project:${name}`;
  await PROJECTS_DB.removeItem(key);
  const index = await readIndex();
  const next = index.filter((i) => i.name !== name);
  await writeIndex(next);
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const index = await readIndex();
  // Newest first
  return index.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}
