// Multiple Float Path analysis (backward traversal)
// Computes a simple float path partition by walking from project finish
// through driving predecessors and branching paths when multiple drivers exist.

import type { Activity, Relationship } from "../types/schedule";

export type FloatPathAssignment = {
  activityId: string;
  floatPathNumber: number;
};

type Times = {
  es: number; // earliest start (days)
  ef: number; // earliest finish (days)
  ls: number; // latest start (days)
  lf: number; // latest finish (days)
  duration: number; // days
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(startISO: string, endISO: string): number {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  return Math.max(0, (e - s) / MS_PER_DAY);
}

function toDays(ms: number): number {
  return ms / MS_PER_DAY;
}

function toDaysSince(ms: number, baselineMs: number): number {
  return (ms - baselineMs) / MS_PER_DAY;
}

function projectStartMs(activities: Activity[]): number {
  let minMs = Number.POSITIVE_INFINITY;
  for (const a of activities) {
    const ms = new Date(a.start).getTime();
    if (!isNaN(ms)) minMs = Math.min(minMs, ms);
  }
  return isFinite(minMs) ? minMs : 0;
}

function topoOrder(
  activities: Activity[],
  relationships: Relationship[]
): string[] {
  const ids = activities.map((a) => a.id);
  const indeg = new Map<string, number>();
  const succ = new Map<string, string[]>();
  for (const id of ids) {
    indeg.set(id, 0);
    succ.set(id, []);
  }
  for (const r of relationships) {
    if (!indeg.has(r.predecessorId) || !indeg.has(r.successorId)) continue;
    indeg.set(r.successorId, (indeg.get(r.successorId) || 0) + 1);
    succ.get(r.predecessorId)!.push(r.successorId);
  }
  const q: string[] = [];
  for (const [id, d] of indeg) if (d === 0) q.push(id);
  const order: string[] = [];
  while (q.length) {
    const id = q.shift()!;
    order.push(id);
    for (const s of succ.get(id) || []) {
      indeg.set(s, (indeg.get(s) || 0) - 1);
      if ((indeg.get(s) || 0) === 0) q.push(s);
    }
  }
  return order.length === ids.length ? order : ids;
}

function constraintStartFromPred(
  pred: Times,
  succ: Times,
  relType: Relationship["type"],
  lagDays: number
): number {
  switch (relType) {
    case "SS":
      return pred.es + lagDays;
    case "FF":
      return pred.ef + lagDays - succ.duration;
    case "SF":
      return pred.es + lagDays - succ.duration;
    case "FS":
    default:
      return pred.ef + lagDays;
  }
}

function isDriving(
  pred: Times,
  succ: Times,
  relType: Relationship["type"],
  lagDays: number
): boolean {
  const EPS = 1e-6;
  switch (relType) {
    case "SS":
      return Math.abs(succ.es - (pred.es + lagDays)) < EPS;
    case "FF":
      return Math.abs(succ.ef - (pred.ef + lagDays)) < EPS;
    case "SF":
      return Math.abs(succ.ef - (pred.es + lagDays)) < EPS;
    case "FS":
    default:
      return Math.abs(succ.es - (pred.ef + lagDays)) < EPS;
  }
}

export function assignFloatPathNumbers(
  activities: Activity[],
  relationships: Relationship[] = []
): FloatPathAssignment[] {
  if (!activities.length) return [];

  const byId = new Map<string, Activity>();
  for (const a of activities) byId.set(a.id, a);

  const inEdges = new Map<string, Relationship[]>();
  const outEdges = new Map<string, Relationship[]>();
  for (const r of relationships) {
    const type = r.type ?? "FS";
    const lag = r.lagDays ?? 0;
    const norm: Relationship = { ...r, type, lagDays: lag };
    if (!inEdges.has(r.successorId)) inEdges.set(r.successorId, []);
    if (!outEdges.has(r.predecessorId)) outEdges.set(r.predecessorId, []);
    inEdges.get(r.successorId)!.push(norm);
    outEdges.get(r.predecessorId)!.push(norm);
  }

  // Initialize activity times from dates
  const times = new Map<string, Times>();
  for (const a of activities) {
    const duration = a.durationDays ?? daysBetween(a.start, a.finish);
    times.set(a.id, {
      es: toDays(new Date(a.start).getTime()),
      ef: toDays(new Date(a.finish).getTime()),
      ls: toDays(new Date(a.start).getTime()),
      lf: toDays(new Date(a.finish).getTime()),
      duration,
    });
  }

  // Forward pass (few iterations)
  for (let iter = 0; iter < 8; iter++) {
    let changed = false;
    for (const a of activities) {
      const t = times.get(a.id)!;
      let es = Number.NEGATIVE_INFINITY;
      const preds = inEdges.get(a.id) ?? [];
      if (preds.length === 0) {
        es = t.es;
      } else {
        for (const r of preds) {
          const p = times.get(r.predecessorId)!;
          const requiredES = constraintStartFromPred(
            p,
            t,
            r.type ?? "FS",
            r.lagDays ?? 0
          );
          es = Math.max(es, requiredES);
        }
      }
      const ef = es + t.duration;
      if (es > t.es + 1e-6 || ef > t.ef + 1e-6) {
        t.es = es;
        t.ef = ef;
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Project finish EF and representative finish activity
  let projectEF = Number.NEGATIVE_INFINITY;
  let finishId = activities[0].id;
  for (const a of activities) {
    const t = times.get(a.id)!;
    if (t.ef > projectEF) {
      projectEF = t.ef;
      finishId = a.id;
    }
  }

  // Backward pass (few iterations)
  for (let iter = 0; iter < 8; iter++) {
    let changed = false;
    for (let i = activities.length - 1; i >= 0; i--) {
      const a = activities[i];
      const t = times.get(a.id)!;
      let lf = projectEF;
      const succs = outEdges.get(a.id) ?? [];
      if (succs.length === 0) {
        // Terminal activity: LF = project finish (ensures non-critical terminals get positive float)
        lf = projectEF;
      } else {
        for (const r of succs) {
          const s = times.get(r.successorId)!;
          switch (r.type ?? "FS") {
            case "SS": {
              const ls = s.ls - (r.lagDays ?? 0);
              lf = Math.min(lf, ls + t.duration);
              break;
            }
            case "FF": {
              const lfFromSucc = s.lf - (r.lagDays ?? 0);
              lf = Math.min(lf, lfFromSucc);
              break;
            }
            case "SF": {
              const ls = s.lf - (r.lagDays ?? 0);
              lf = Math.min(lf, ls + t.duration);
              break;
            }
            case "FS":
            default: {
              const lsSucc = s.ls - (r.lagDays ?? 0);
              lf = Math.min(lf, lsSucc);
              break;
            }
          }
        }
      }
      const ls = lf - t.duration;
      if (lf < t.lf - 1e-6 || ls < t.ls - 1e-6) {
        t.lf = lf;
        t.ls = ls;
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Anchor project finish to zero float
  const finishTimes = times.get(finishId)!;
  finishTimes.lf = finishTimes.ef;
  finishTimes.ls = finishTimes.es;

  // Driving predecessors mapping
  const drivingPreds = new Map<string, string[]>();
  for (const a of activities) {
    const succId = a.id;
    const succT = times.get(succId)!;
    const preds = inEdges.get(succId) ?? [];
    for (const r of preds) {
      const predT = times.get(r.predecessorId)!;
      if (isDriving(predT, succT, r.type ?? "FS", r.lagDays ?? 0)) {
        if (!drivingPreds.has(succId)) drivingPreds.set(succId, []);
        drivingPreds.get(succId)!.push(r.predecessorId);
      }
    }
  }

  // Backward traversal; branch creates new path number
  const assignment = new Map<string, number>();
  let nextPath = 1;
  const queue: Array<{ id: string; path: number }> = [];

  assignment.set(finishId, nextPath);
  queue.push({ id: finishId, path: nextPath });
  nextPath++;

  while (queue.length) {
    const { id, path } = queue.shift()!;
    const preds = drivingPreds.get(id) ?? [];
    if (preds.length === 0) continue;

    const [first, ...rest] = preds;
    if (first) {
      if (!assignment.has(first)) assignment.set(first, path);
      queue.push({ id: first, path });
    }
    for (const p of rest) {
      const pathNum = nextPath++;
      if (!assignment.has(p)) assignment.set(p, pathNum);
      queue.push({ id: p, path: pathNum });
    }
  }

  // Fallback for unassigned activities
  for (const a of activities) {
    if (!assignment.has(a.id)) assignment.set(a.id, nextPath);
  }

  return activities.map((a) => ({
    activityId: a.id,
    floatPathNumber: assignment.get(a.id)!,
  }));
}

export function computeMetrics(
  activities: Activity[],
  relationships: Relationship[] = []
): Array<{
  activityId: string;
  durationDays: number;
  totalFloatDays: number;
  freeFloatDays: number;
  floatPathNumber: number;
  es: number;
  ef: number;
  ls: number;
  lf: number;
}> {
  if (!activities.length) return [];

  // Build edges
  const inEdges = new Map<string, Relationship[]>();
  const outEdges = new Map<string, Relationship[]>();
  for (const r of relationships) {
    const type = r.type ?? "FS";
    const lag = r.lagDays ?? 0;
    const norm: Relationship = { ...r, type, lagDays: lag };
    if (!inEdges.has(r.successorId)) inEdges.set(r.successorId, []);
    if (!outEdges.has(r.predecessorId)) outEdges.set(r.predecessorId, []);
    inEdges.get(r.successorId)!.push(norm);
    outEdges.get(r.predecessorId)!.push(norm);
  }

  // Baseline and times init (days since project start)
  const baseline = projectStartMs(activities);
  const times = new Map<string, Times>();
  for (const a of activities) {
    const duration = a.durationDays ?? daysBetween(a.start, a.finish);
    times.set(a.id, {
      es: toDaysSince(new Date(a.start).getTime(), baseline),
      ef: toDaysSince(new Date(a.finish).getTime(), baseline),
      ls: toDaysSince(new Date(a.start).getTime(), baseline),
      lf: toDaysSince(new Date(a.finish).getTime(), baseline),
      duration,
    });
  }

  // Forward pass (topological order)
  const order = topoOrder(activities, relationships);
  for (let iter = 0; iter < 100; iter++) {
    let changed = false;
    for (const id of order) {
      const t = times.get(id)!;
      let es = Number.NEGATIVE_INFINITY;
      const preds = inEdges.get(id) ?? [];
      if (preds.length === 0) es = t.es;
      else {
        for (const r of preds) {
          const p = times.get(r.predecessorId)!;
          const requiredES = constraintStartFromPred(
            p,
            t,
            r.type ?? "FS",
            r.lagDays ?? 0
          );
          es = Math.max(es, requiredES);
        }
      }
      const ef = es + t.duration;
      if (Math.abs(es - t.es) > 1e-6 || Math.abs(ef - t.ef) > 1e-6) {
        t.es = es;
        t.ef = ef;
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Project EF and finish node
  let projectEF = Number.NEGATIVE_INFINITY;
  let finishId = activities[0].id;
  for (const a of activities) {
    const t = times.get(a.id)!;
    if (t.ef > projectEF) {
      projectEF = t.ef;
      finishId = a.id;
    }
  }

  // Backward pass (reverse topological order)
  const rev = [...order].reverse();
  for (let iter = 0; iter < 100; iter++) {
    let changed = false;
    for (const id of rev) {
      const t = times.get(id)!;
      let lf = projectEF;
      const succs = outEdges.get(id) ?? [];
      if (succs.length === 0) lf = projectEF;
      else {
        for (const r of succs) {
          const s = times.get(r.successorId)!;
          switch (r.type ?? "FS") {
            case "SS": {
              const ls = s.ls - (r.lagDays ?? 0);
              lf = Math.min(lf, ls + t.duration);
              break;
            }
            case "FF": {
              const lfFromSucc = s.lf - (r.lagDays ?? 0);
              lf = Math.min(lf, lfFromSucc);
              break;
            }
            case "SF": {
              const ls = s.lf - (r.lagDays ?? 0);
              lf = Math.min(lf, ls + t.duration);
              break;
            }
            case "FS":
            default: {
              const lsSucc = s.ls - (r.lagDays ?? 0);
              lf = Math.min(lf, lsSucc);
              break;
            }
          }
        }
      }
      const ls = lf - t.duration;
      if (Math.abs(lf - t.lf) > 1e-6 || Math.abs(ls - t.ls) > 1e-6) {
        t.lf = lf;
        t.ls = ls;
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Anchor project finish to zero float
  {
    const ft = times.get(finishId)!;
    ft.lf = ft.ef;
    ft.ls = ft.es;
  }

  // Driving predecessors and path assignment
  const drivingPreds = new Map<string, string[]>();
  for (const a of activities) {
    const succId = a.id;
    const succT = times.get(succId)!;
    const preds = inEdges.get(succId) ?? [];
    for (const r of preds) {
      const predT = times.get(r.predecessorId)!;
      if (isDriving(predT, succT, r.type ?? "FS", r.lagDays ?? 0)) {
        if (!drivingPreds.has(succId)) drivingPreds.set(succId, []);
        drivingPreds.get(succId)!.push(r.predecessorId);
      }
    }
  }
  const assignment = new Map<string, number>();
  let nextPath = 1;
  const queue: Array<{ id: string; path: number }> = [];
  assignment.set(finishId, nextPath);
  queue.push({ id: finishId, path: nextPath });
  nextPath++;
  while (queue.length) {
    const { id, path } = queue.shift()!;
    const preds = drivingPreds.get(id) ?? [];
    if (preds.length === 0) continue;
    const [first, ...rest] = preds;
    if (first) {
      if (!assignment.has(first)) assignment.set(first, path);
      queue.push({ id: first, path });
    }
    for (const p of rest) {
      const pn = nextPath++;
      if (!assignment.has(p)) assignment.set(p, pn);
      queue.push({ id: p, path: pn });
    }
  }
  for (const a of activities)
    if (!assignment.has(a.id)) assignment.set(a.id, nextPath);

  // Compose metrics
  return activities.map((a) => {
    const t = times.get(a.id)!;
    const rawTf = Math.min(t.ls - t.es, t.lf - t.ef);
    const tf = Math.abs(rawTf) < 1e-6 ? 0 : rawTf; // clamp tiny negatives to zero
    // Free float: min slack to immediate successors; terminals use total float
    let ff = tf;
    const succs = outEdges.get(a.id) ?? [];
    if (succs.length > 0) {
      let minSlack = Number.POSITIVE_INFINITY;
      for (const r of succs) {
        const s = times.get(r.successorId)!;
        // Compute constraint finish bound for predecessor using successor late times,
        // then compare to predecessor early finish
        let constraintFinish: number;
        switch (r.type ?? "FS") {
          case "SS": {
            const ls = s.ls - (r.lagDays ?? 0);
            constraintFinish = ls + t.duration;
            break;
          }
          case "FF": {
            constraintFinish = s.lf - (r.lagDays ?? 0);
            break;
          }
          case "SF": {
            const ls = s.lf - (r.lagDays ?? 0);
            constraintFinish = ls + t.duration;
            break;
          }
          case "FS":
          default: {
            const lsSucc = s.ls - (r.lagDays ?? 0);
            constraintFinish = lsSucc;
            break;
          }
        }
        const slack = constraintFinish - t.ef;
        minSlack = Math.min(minSlack, slack);
      }
      ff = Math.max(0, minSlack);
    }
    return {
      activityId: a.id,
      durationDays: t.duration,
      totalFloatDays: tf,
      freeFloatDays: ff,
      floatPathNumber: assignment.get(a.id)!,
      es: t.es,
      ef: t.ef,
      ls: t.ls,
      lf: t.lf,
    };
  });
}
