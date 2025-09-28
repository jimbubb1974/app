import type { Activity, Relationship } from "../types/schedule";

/**
 * Computes predecessor and successor arrays for each activity based on relationships
 */
export function computeActivityRelationships(
  activities: Activity[],
  relationships: Relationship[]
): Activity[] {
  // Create maps for quick lookup
  const activityMap = new Map<string, Activity>();
  activities.forEach((activity) => {
    activityMap.set(activity.id, { ...activity });
  });

  // Initialize predecessor and successor arrays
  activities.forEach((activity) => {
    const updatedActivity = activityMap.get(activity.id)!;
    updatedActivity.predecessors = [];
    updatedActivity.successors = [];
  });

  // Process relationships to build predecessor/successor lists
  relationships.forEach((relationship) => {
    const predecessor = activityMap.get(relationship.predecessorId);
    const successor = activityMap.get(relationship.successorId);

    if (predecessor && successor) {
      // Add successor to predecessor's successors list
      if (!predecessor.successors!.includes(relationship.successorId)) {
        predecessor.successors!.push(relationship.successorId);
      }

      // Add predecessor to successor's predecessors list
      if (!successor.predecessors!.includes(relationship.predecessorId)) {
        successor.predecessors!.push(relationship.predecessorId);
      }
    }
  });

  return Array.from(activityMap.values());
}

/**
 * Gets all activities that are predecessors of the given activity
 */
export function getPredecessors(
  activityId: string,
  activities: Activity[]
): Activity[] {
  const activity = activities.find((a) => a.id === activityId);
  if (!activity || !activity.predecessors) return [];

  return activities.filter((a) => activity.predecessors!.includes(a.id));
}

/**
 * Gets all activities that are successors of the given activity
 */
export function getSuccessors(
  activityId: string,
  activities: Activity[]
): Activity[] {
  const activity = activities.find((a) => a.id === activityId);
  if (!activity || !activity.successors) return [];

  return activities.filter((a) => activity.successors!.includes(a.id));
}

/**
 * Gets the relationship between two activities
 */
export function getRelationship(
  predecessorId: string,
  successorId: string,
  relationships: Relationship[]
): Relationship | undefined {
  return relationships.find(
    (r) => r.predecessorId === predecessorId && r.successorId === successorId
  );
}
