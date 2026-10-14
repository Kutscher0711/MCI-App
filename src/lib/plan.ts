import { EXERCISES, EXERCISE_BY_ID } from "../data/exercises";
import type { Equipment, Exercise, Goal, Level, LoggedSet, Muscle, Plan, PlanDay, PlannedExercise, Profile } from "../types";

interface Slot {
  muscle: Muscle;
  compound: boolean;
}

const s = (muscle: Muscle, compound = true): Slot => ({ muscle, compound });

// Slots in Prioritätsreihenfolge – kürzere Einheiten schneiden hinten ab.
const TEMPLATES: Record<string, { name: string; focus: string; slots: Slot[] }> = {
  fullA: { name: "Ganzkörper A", focus: "Kniebeuge · Drücken · Ziehen", slots: [s("beine"), s("brust"), s("ruecken"), s("po"), s("schultern"), s("core", false), s("bizeps", false), s("trizeps", false)] },
  fullB: { name: "Ganzkörper B", focus: "Hüfte · Ziehen · Drücken", slots: [s("po"), s("ruecken"), s("schultern"), s("beine"), s("brust"), s("core", false), s("trizeps", false), s("waden", false)] },
  fullC: { name: "Ganzkörper C", focus: "Einbeinig · Volumen", slots: [s("beine"), s("ruecken"), s("brust"), s("po"), s("schultern", false), s("core", false), s("bizeps", false), s("trizeps", false)] },
  upper: { name: "Oberkörper", focus: "Brust · Rücken · Schultern · Arme", slots: [s("brust"), s("ruecken"), s("schultern"), s("ruecken"), s("brust", false), s("schultern", false), s("bizeps", false), s("trizeps", false)] },
  lower: { name: "Unterkörper", focus: "Beine · Po · Core", slots: [s("beine"), s("po"), s("beine"), s("po"), s("beine", false), s("waden", false), s("core", false), s("core", false)] },
  push: { name: "Push", focus: "Brust · Schultern · Trizeps", slots: [s("brust"), s("schultern"), s("brust"), s("schultern", false), s("trizeps", false), s("brust", false), s("trizeps", false)] },
  pull: { name: "Pull", focus: "Rücken · Bizeps", slots: [s("ruecken"), s("ruecken"), s("ruecken"), s("schultern", false), s("bizeps", false), s("bizeps", false), s("core", false)] },
  legs: { name: "Beine", focus: "Quadrizeps · Po · Waden", slots: [s("beine"), s("po"), s("beine"), s("beine", false), s("waden", false), s("core", false), s("core", false)] },
};

const SPLITS: Record<number, { split: string; days: string[] }> = {
  1: { split: "Ganzkörper", days: ["fullA"] },
  2: { split: "Ganzkörper", days: ["fullA", "fullB"] },
  3: { split: "Ganzkörper", days: ["fullA", "fullB", "fullC"] },
  4: { split: "Ober-/Unterkörper", days: ["upper", "lower", "upper", "lower"] },
  5: { split: "Push/Pull/Beine + OK/UK", days: ["push", "pull", "legs", "upper", "lower"] },
  6: { split: "Push/Pull/Beine ×2", days: ["push", "pull", "legs", "push", "pull", "legs"] },
};

const LEVEL_RANK: Record<Level, number> = { anfaenger: 0, fortgeschritten: 1, profi: 2 };

export function repScheme(goal: Goal, compound: boolean): { repMin: number; repMax: number; restSec: number } {
  const base = {
    kraft: { repMin: 4, repMax: 6, restSec: 180 },
    muskelaufbau: { repMin: 8, repMax: 12, restSec: 90 },
    fettabbau: { repMin: 10, repMax: 15, restSec: 60 },
    fitness: { repMin: 8, repMax: 15, restSec: 75 },
  }[goal];
  if (compound) return base;
  return { repMin: Math.max(base.repMin, 8) + 2, repMax: Math.max(base.repMax, 12) + 3, restSec: Math.min(base.restSec, 75) };
}

export function exercisesPerSession(minutes: number): number {
  if (minutes <= 30) return 4;
  if (minutes <= 45) return 5;
  if (minutes <= 60) return 6;
  return 7;
}

export function setsFor(level: Level, compound: boolean): number {
  if (level === "anfaenger") return compound ? 3 : 2;
  if (level === "fortgeschritten") return 3;
  return compound ? 4 : 3;
}

function roundTo(value: number, step: number): number {
  return Math.max(step, Math.round(value / step) * step);
}

export function startingWeight(ex: Exercise, profile: Profile): number {
  if (ex.equipment === "koerpergewicht" || ex.equipment === "band") return 0;
  const lvl = { anfaenger: 1, fortgeschritten: 1.4, profi: 1.8 }[profile.level];
  const sexFactor = profile.sex === "w" ? 0.7 : 1;
  const bw = profile.weightKg * lvl * sexFactor;
  const legBonus = ex.pattern === "legs" ? 1.4 : 1;
  switch (ex.equipment) {
    case "langhantel":
      return roundTo(bw * 0.45 * legBonus, 2.5);
    case "maschine":
    case "kabel":
      return roundTo(bw * (ex.compound ? 0.4 : 0.2) * legBonus, 2.5);
    case "kurzhantel":
    case "kettlebell":
      return roundTo(bw * (ex.compound ? 0.12 : 0.06) * legBonus, 1);
    default:
      return 0;
  }
}

export function availableExercises(equipment: Equipment[], level: Level): Exercise[] {
  const eq = new Set<Equipment>([...equipment, "koerpergewicht"]);
  return EXERCISES.filter((e) => eq.has(e.equipment) && LEVEL_RANK[e.level] <= LEVEL_RANK[level]);
}

/** Wählt für einen Slot die passendste Übung, die heute noch nicht verwendet wird. */
function pickExercise(slot: Slot, pool: Exercise[], usedToday: Set<string>, usage: Map<string, number>): Exercise | undefined {
  const candidates = pool.filter((e) => e.muscle === slot.muscle && !usedToday.has(e.id));
  if (candidates.length === 0) return undefined;
  const score = (e: Exercise) =>
    (e.compound === slot.compound ? 0 : 10) + (usage.get(e.id) ?? 0) * 3 + (e.equipment === "koerpergewicht" ? 1 : 0);
  return [...candidates].sort((a, b) => score(a) - score(b))[0];
}

export function generatePlan(profile: Profile): Plan {
  const days = Math.min(6, Math.max(1, Math.round(profile.daysPerWeek)));
  const { split, days: templateKeys } = SPLITS[days];
  const pool = availableExercises(profile.equipment, profile.level);
  const perSession = exercisesPerSession(profile.sessionMinutes);
  const usage = new Map<string, number>();

  const planDays: PlanDay[] = templateKeys.map((key, i) => {
    const tpl = TEMPLATES[key];
    const usedToday = new Set<string>();
    const exercises: PlannedExercise[] = [];
    for (const slot of tpl.slots) {
      if (exercises.length >= perSession) break;
      const ex = pickExercise(slot, pool, usedToday, usage);
      if (!ex) continue;
      usedToday.add(ex.id);
      usage.set(ex.id, (usage.get(ex.id) ?? 0) + 1);
      exercises.push({
        exerciseId: ex.id,
        sets: setsFor(profile.level, ex.compound),
        ...repScheme(profile.goal, ex.compound),
        weightKg: startingWeight(ex, profile),
      });
    }
    const suffix = templateKeys.filter((k) => k === key).length > 1 ? ` ${templateKeys.slice(0, i + 1).filter((k) => k === key).length}` : "";
    return { id: `${key}-${i}`, name: tpl.name + suffix, focus: tpl.focus, exercises };
  });

  return { createdAt: new Date().toISOString(), split, days: planDays, nextDayIndex: 0 };
}

export function weightIncrement(exerciseId: string): number {
  const ex = EXERCISE_BY_ID[exerciseId];
  if (!ex) return 2.5;
  if (ex.equipment === "kurzhantel" || ex.equipment === "kettlebell") return ex.compound ? 2 : 1;
  return ex.compound && ex.pattern === "legs" ? 5 : 2.5;
}

export type ProgressionResult = { planned: PlannedExercise; change: "hoch" | "runter" | "gleich"; note: string };

/**
 * Doppelte Progression: Erst Wiederholungen bis zum oberen Ende steigern,
 * dann Gewicht erhöhen. Bei deutlicher Unterschreitung wird leicht reduziert.
 */
export function progress(planned: PlannedExercise, sets: LoggedSet[], rpe: number): ProgressionResult {
  const done = sets.filter((x) => x.done);
  if (done.length === 0) return { planned, change: "gleich", note: "Nicht absolviert" };

  const bodyweight = planned.weightKg === 0;
  const allTop = done.length >= planned.sets && done.every((x) => x.reps >= planned.repMax);
  const missed = done.filter((x) => x.reps < planned.repMin).length;

  if (allTop && rpe <= 9) {
    if (bodyweight) {
      return {
        planned: { ...planned, repMin: planned.repMin + 2, repMax: planned.repMax + 2 },
        change: "hoch",
        note: `+2 Wdh. Ziel: ${planned.repMin + 2}–${planned.repMax + 2}`,
      };
    }
    const inc = weightIncrement(planned.exerciseId);
    return { planned: { ...planned, weightKg: planned.weightKg + inc }, change: "hoch", note: `+${inc} kg` };
  }

  if (missed >= 2 && !bodyweight) {
    const step = weightIncrement(planned.exerciseId);
    const next = Math.max(step, Math.round((planned.weightKg * 0.9) / step) * step);
    if (next < planned.weightKg) {
      return { planned: { ...planned, weightKg: next }, change: "runter", note: `Auf ${next} kg reduziert – sauber aufbauen` };
    }
  }

  return { planned, change: "gleich", note: "Gewicht halten, Wiederholungen steigern" };
}

export function swapExercise(planned: PlannedExercise, newId: string, profile: Profile): PlannedExercise {
  const ex = EXERCISE_BY_ID[newId];
  return { ...planned, exerciseId: newId, ...repScheme(profile.goal, ex.compound), sets: setsFor(profile.level, ex.compound), weightKg: startingWeight(ex, profile) };
}

export function alternativesFor(exerciseId: string, profile: Profile): Exercise[] {
  const ex = EXERCISE_BY_ID[exerciseId];
  return availableExercises(profile.equipment, profile.level).filter((e) => e.muscle === ex.muscle && e.id !== ex.id);
}
