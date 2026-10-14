import { describe, expect, it } from "vitest";
import { EXERCISE_BY_ID } from "../data/exercises";
import { reducer, emptyState } from "../store";
import type { AppState, Profile } from "../types";
import { bmr, cardioKcal, targets } from "./nutrition";
import { generatePlan, progress } from "./plan";
import { levelFromXp, weekKey, weekStreak } from "./progress";

const profile: Profile = {
  name: "Test",
  sex: "m",
  age: 30,
  heightCm: 180,
  weightKg: 80,
  goal: "muskelaufbau",
  level: "anfaenger",
  daysPerWeek: 3,
  sessionMinutes: 60,
  equipment: ["langhantel", "kurzhantel", "maschine", "kabel"],
  activity: 1.55,
};

describe("generatePlan", () => {
  it("wählt den Split nach Trainingstagen", () => {
    expect(generatePlan(profile).days).toHaveLength(3);
    expect(generatePlan({ ...profile, daysPerWeek: 4 }).split).toBe("Ober-/Unterkörper");
    expect(generatePlan({ ...profile, daysPerWeek: 6 }).days.map((d) => d.name)[3]).toBe("Push 2");
  });

  it("nutzt nur verfügbares Equipment und das passende Level", () => {
    const plan = generatePlan({ ...profile, equipment: [] });
    for (const d of plan.days) {
      expect(d.exercises.length).toBeGreaterThan(0);
      for (const e of d.exercises) {
        const ex = EXERCISE_BY_ID[e.exerciseId];
        expect(ex.equipment).toBe("koerpergewicht");
        expect(ex.level).toBe("anfaenger");
        expect(e.weightKg).toBe(0);
      }
    }
  });

  it("wiederholt keine Übung innerhalb eines Tages und respektiert die Dauer", () => {
    const plan = generatePlan({ ...profile, sessionMinutes: 30 });
    for (const d of plan.days) {
      expect(new Set(d.exercises.map((e) => e.exerciseId)).size).toBe(d.exercises.length);
      expect(d.exercises.length).toBeLessThanOrEqual(4);
    }
  });
});

describe("progress (doppelte Progression)", () => {
  const pe = { exerciseId: "bankdruecken", sets: 3, repMin: 8, repMax: 12, restSec: 90, weightKg: 60 };
  const sets = (reps: number[]) => reps.map((r) => ({ reps: r, weightKg: 60, done: true }));

  it("erhöht das Gewicht, wenn alle Sätze das obere Ende erreichen", () => {
    expect(progress(pe, sets([12, 12, 12]), 8).planned.weightKg).toBe(62.5);
  });
  it("hält das Gewicht im Zielbereich", () => {
    expect(progress(pe, sets([12, 10, 9]), 8).change).toBe("gleich");
  });
  it("reduziert bei deutlichem Unterschreiten", () => {
    const r = progress(pe, sets([6, 5, 5]), 10);
    expect(r.change).toBe("runter");
    expect(r.planned.weightKg).toBeLessThan(60);
  });
  it("steigert bei Körpergewicht die Wiederholungen", () => {
    const bw = { ...pe, exerciseId: "liegestuetz", weightKg: 0 };
    const r = progress(bw, [12, 12, 12].map((reps) => ({ reps, weightKg: 0, done: true })), 7);
    expect(r.planned.repMax).toBe(14);
  });
});

describe("nutrition", () => {
  it("berechnet den Grundumsatz nach Mifflin-St Jeor", () => {
    expect(bmr(profile)).toBe(1780);
    expect(bmr({ ...profile, sex: "w" })).toBe(1614);
  });
  it("Makros ergeben ungefähr das Kalorienziel", () => {
    const t = targets(profile);
    expect(Math.abs(t.protein * 4 + t.carbs * 4 + t.fat * 9 - t.kcal)).toBeLessThan(15);
    expect(t.kcal).toBeGreaterThan(t.tdee);
    expect(targets({ ...profile, goal: "fettabbau" }).kcal).toBeLessThan(t.tdee);
  });
  it("Cardio-kcal über MET", () => {
    expect(cardioKcal(10, 80, 30)).toBe(400);
  });
});

describe("gamification", () => {
  it("Level-Kurve", () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(899).level).toBe(3);
  });
  it("Wochen-Streak zählt aufeinanderfolgende erfüllte Wochen", () => {
    const mk = (date: string) => ({ id: date, date, dayId: "x", dayName: "x", durationMin: 50, rpe: 7, exercises: [] });
    const state: AppState = {
      ...emptyState,
      profile: { ...profile, daysPerWeek: 2 },
      workouts: ["2026-10-05", "2026-10-07", "2026-09-29", "2026-10-01", "2026-09-15", "2026-09-16"].map((d) => mk(d + "T10:00:00Z")),
    };
    expect(weekKey("2026-10-08")).toBe("2026-10-05");
    // aktuelle Woche (12.10.) noch offen → zählt nicht, aber bricht die Serie nicht
    expect(weekStreak(state, "2026-10-14T10:00:00Z")).toBe(2);
  });
});

describe("reducer", () => {
  it("übernimmt Progression nach einem Workout und rückt zum nächsten Tag", () => {
    const plan = generatePlan(profile);
    const day = plan.days[0];
    const first = day.exercises[0];
    let state: AppState = { ...emptyState, profile, plan };
    state = reducer(state, {
      type: "finishWorkout",
      log: {
        id: "1",
        date: new Date().toISOString(),
        dayId: day.id,
        dayName: day.name,
        durationMin: 55,
        rpe: 7,
        exercises: [{ exerciseId: first.exerciseId, sets: Array.from({ length: first.sets }, () => ({ reps: first.repMax, weightKg: first.weightKg, done: true })) }],
      },
    });
    expect(state.plan!.nextDayIndex).toBe(1);
    expect(state.plan!.days[0].exercises[0].weightKg).toBeGreaterThan(first.weightKg);
    expect(state.workouts).toHaveLength(1);
  });
});
