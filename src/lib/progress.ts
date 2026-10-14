import type { AppState } from "../types";

export const today = () => new Date().toISOString().slice(0, 10);
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** Montag der Woche als YYYY-MM-DD */
export function weekKey(dateIso: string): string {
  const d = new Date(dateIso.slice(0, 10) + "T12:00:00Z");
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export function computeXp(state: AppState): number {
  const workoutXp = state.workouts.reduce((acc, w) => acc + 100 + w.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).length * 5, 0), 0);
  const cardioXp = state.cardio.reduce((acc, c) => acc + c.minutes * 2, 0);
  const mobilityXp = state.mobility.length * 30;
  const foodDays = new Set(state.food.map((f) => f.date)).size * 20;
  return workoutXp + cardioXp + mobilityXp + foodDays;
}

export function levelFromXp(xp: number): { level: number; current: number; next: number; progress: number } {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const current = (level - 1) ** 2 * 100;
  const next = level ** 2 * 100;
  return { level, current, next, progress: (xp - current) / (next - current) };
}

export const RANKS = ["Rookie", "Athlet", "Kämpfer", "Champion", "Legende", "Titan"];
export const rankFor = (level: number) => RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 5))];

/** Anzahl aufeinanderfolgender Wochen (inkl. aktueller, falls schon erreicht), in denen das Trainingsziel erfüllt wurde. */
export function weekStreak(state: AppState, nowIso = new Date().toISOString()): number {
  const target = state.profile?.daysPerWeek ?? 3;
  const perWeek = new Map<string, number>();
  for (const w of state.workouts) perWeek.set(weekKey(w.date), (perWeek.get(weekKey(w.date)) ?? 0) + 1);

  let streak = 0;
  const cursor = new Date(weekKey(nowIso) + "T12:00:00Z");
  if ((perWeek.get(weekKey(nowIso)) ?? 0) >= target) streak++;
  for (;;) {
    cursor.setUTCDate(cursor.getUTCDate() - 7);
    const k = cursor.toISOString().slice(0, 10);
    if ((perWeek.get(k) ?? 0) >= target) streak++;
    else break;
  }
  return streak;
}

export function workoutsThisWeek(state: AppState, nowIso = new Date().toISOString()): number {
  const k = weekKey(nowIso);
  return state.workouts.filter((w) => weekKey(w.date) === k).length;
}

export function totalVolume(state: AppState): number {
  return state.workouts.reduce(
    (acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).reduce((b, x) => b + x.reps * x.weightKg, 0), 0),
    0,
  );
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  desc: string;
  earned: boolean;
}

export function badges(state: AppState): Badge[] {
  const vol = totalVolume(state);
  const cardioMin = state.cardio.reduce((a, c) => a + c.minutes, 0);
  const streak = weekStreak(state);
  const list: (Omit<Badge, "earned"> & { test: boolean })[] = [];
  const add = (id: string, name: string, icon: string, desc: string, test: boolean) => list.push({ id, name, icon, desc, test });
  add("first", "Erster Schritt", "🎯", "Erstes Workout abgeschlossen", state.workouts.length >= 1);
  add("ten", "Dranbleiber", "💪", "10 Workouts", state.workouts.length >= 10);
  add("fifty", "Eiserner Wille", "🏋️", "50 Workouts", state.workouts.length >= 50);
  add("ton", "Tonnenschieber", "🧱", "10.000 kg Gesamtvolumen", vol >= 10_000);
  add("hundredton", "Schwerlast", "🚛", "100.000 kg Gesamtvolumen", vol >= 100_000);
  add("cardio", "Ausdauer-Ass", "🫀", "300 Minuten Cardio", cardioMin >= 300);
  add("mobile", "Geschmeidig", "🧘", "10 Mobility-Einheiten", state.mobility.length >= 10);
  add("streak4", "Konstanz", "🔥", "4 Wochen Streak", streak >= 4);
  add("food7", "Ernährungsprofi", "🥗", "7 Tage Ernährung getrackt", new Set(state.food.map((f) => f.date)).size >= 7);
  return list.map(({ test, ...b }) => ({ ...b, earned: test }));
}
