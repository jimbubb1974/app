import { analyzeScheduleLayout } from "../autoLayoutAnalysis";
import type { Activity, Relationship } from "../../types/schedule";

// Sample test data
const sampleActivities: Activity[] = [
  {
    id: "A1",
    name: "Activity 1",
    start: "2024-01-01",
    finish: "2024-01-10",
    isCritical: true,
    predecessors: [],
    successors: ["A2"],
  },
  {
    id: "A2",
    name: "Activity 2",
    start: "2024-01-15",
    finish: "2024-01-25",
    isCritical: true,
    predecessors: ["A1"],
    successors: ["A3"],
  },
  {
    id: "A3",
    name: "Activity 3",
    start: "2024-01-30",
    finish: "2024-02-05",
    isCritical: true,
    predecessors: ["A2"],
    successors: [],
  },
  {
    id: "B1",
    name: "Parallel Activity 1",
    start: "2024-01-05",
    finish: "2024-01-12",
    isCritical: false,
    predecessors: [],
    successors: [],
  },
];

const sampleRelationships: Relationship[] = [
  {
    predecessorId: "A1",
    successorId: "A2",
    type: "FS",
    lagDays: 0,
  },
  {
    predecessorId: "A2",
    successorId: "A3",
    type: "FS",
    lagDays: 0,
  },
];

describe("Auto-Layout Analysis Engine", () => {
  test("should analyze schedule layout correctly", () => {
    const analysis = analyzeScheduleLayout(
      sampleActivities,
      sampleRelationships
    );

    // Verify analysis structure
    expect(analysis).toHaveProperty("timeGaps");
    expect(analysis).toHaveProperty("dependencyGraph");
    expect(analysis).toHaveProperty("floatPaths");
    expect(analysis).toHaveProperty("groupingInfo");
    expect(analysis).toHaveProperty("baselineMetrics");

    // Verify time gaps are identified
    expect(analysis.timeGaps.length).toBeGreaterThan(0);

    // Verify dependency graph is built
    expect(analysis.dependencyGraph.size).toBe(sampleActivities.length);

    // Verify float paths are identified
    expect(analysis.floatPaths.length).toBeGreaterThan(0);

    // Verify baseline metrics
    expect(analysis.baselineMetrics.totalHeight).toBe(sampleActivities.length);
    expect(analysis.baselineMetrics.criticalPathLength).toBe(3); // A1, A2, A3 are critical
  });

  test("should identify critical path correctly", () => {
    const analysis = analyzeScheduleLayout(
      sampleActivities,
      sampleRelationships
    );

    // Find the critical path
    const criticalPath = analysis.floatPaths.find((path) => path.isCritical);
    expect(criticalPath).toBeDefined();
    expect(criticalPath?.activities).toEqual(["A1", "A2", "A3"]);
  });

  test("should calculate dependency depths correctly", () => {
    const analysis = analyzeScheduleLayout(
      sampleActivities,
      sampleRelationships
    );

    const a1Node = analysis.dependencyGraph.get("A1");
    const a2Node = analysis.dependencyGraph.get("A2");
    const a3Node = analysis.dependencyGraph.get("A3");

    expect(a1Node?.depth).toBe(1);
    expect(a2Node?.depth).toBe(2);
    expect(a3Node?.depth).toBe(3);
  });
});
