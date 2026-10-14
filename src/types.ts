export type Goal = "muskelaufbau" | "fettabbau" | "kraft" | "fitness";
export type Level = "anfaenger" | "fortgeschritten" | "profi";
export type Sex = "m" | "w";
export type Equipment = "koerpergewicht" | "kurzhantel" | "langhantel" | "maschine" | "kabel" | "kettlebell" | "band";
export type Muscle =
  | "brust"
  | "ruecken"
  | "schultern"
  | "bizeps"
  | "trizeps"
  | "beine"
  | "po"
  | "waden"
  | "core";
export type Pattern = "push" | "pull" | "legs" | "core";

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  sessionMinutes: number;
  equipment: Equipment[];
  activity: number; // PAL-Faktor 1.2 – 1.9
}

export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  secondary: Muscle[];
  pattern: Pattern;
  equipment: Equipment;
  compound: boolean;
  level: Level;
  cues: string[];
}

export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  repMin: number;
  repMax: number;
  restSec: number;
  weightKg: number; // aktuelles Arbeitsgewicht, 0 = Körpergewicht
}

export interface PlanDay {
  id: string;
  name: string;
  focus: string;
  exercises: PlannedExercise[];
}

export interface Plan {
  createdAt: string;
  split: string;
  days: PlanDay[];
  nextDayIndex: number;
}

export interface LoggedSet {
  reps: number;
  weightKg: number;
  done: boolean;
}

export interface WorkoutLog {
  id: string;
  date: string;
  dayId: string;
  dayName: string;
  durationMin: number;
  rpe: number; // gefühlte Anstrengung 1–10
  exercises: { exerciseId: string; sets: LoggedSet[] }[];
}

export interface CardioLog {
  id: string;
  date: string;
  activityId: string;
  minutes: number;
  distanceKm?: number;
  kcal: number;
}

export interface MobilityLog {
  id: string;
  date: string;
  routineId: string;
}

export type Meal = "fruehstueck" | "mittag" | "abend" | "snack";

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  meal: Meal;
  foodId: string;
  grams: number;
}

export interface Food {
  id: string;
  name: string;
  kcal: number; // pro 100 g
  protein: number;
  carbs: number;
  fat: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AppState {
  profile: Profile | null;
  plan: Plan | null;
  workouts: WorkoutLog[];
  cardio: CardioLog[];
  mobility: MobilityLog[];
  food: FoodEntry[];
  customFoods: Food[];
  chat: ChatMessage[];
  weightLog: { date: string; kg: number }[];
}
