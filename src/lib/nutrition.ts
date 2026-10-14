import type { Food, FoodEntry, Profile } from "../types";

export interface Targets {
  bmr: number;
  tdee: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Grundumsatz nach Mifflin-St Jeor. */
export function bmr(p: Pick<Profile, "sex" | "weightKg" | "heightCm" | "age">): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(p.sex === "m" ? base + 5 : base - 161);
}

export function targets(p: Profile): Targets {
  const b = bmr(p);
  const tdee = Math.round(b * p.activity);
  const factor = { fettabbau: 0.8, muskelaufbau: 1.1, kraft: 1.05, fitness: 1 }[p.goal];
  const kcal = Math.round((tdee * factor) / 10) * 10;
  const proteinPerKg = p.goal === "fitness" ? 1.6 : 2;
  const protein = Math.round(p.weightKg * proteinPerKg);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { bmr: b, tdee, kcal, protein, carbs, fat };
}

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function macrosFor(food: Food, grams: number): Macros {
  const f = grams / 100;
  return { kcal: food.kcal * f, protein: food.protein * f, carbs: food.carbs * f, fat: food.fat * f };
}

export function sumEntries(entries: FoodEntry[], foods: Record<string, Food>): Macros {
  return entries.reduce<Macros>(
    (acc, e) => {
      const food = foods[e.foodId];
      if (!food) return acc;
      const m = macrosFor(food, e.grams);
      return { kcal: acc.kcal + m.kcal, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/** kcal = MET × kg × Stunden */
export function cardioKcal(met: number, weightKg: number, minutes: number): number {
  return Math.round(met * weightKg * (minutes / 60));
}
