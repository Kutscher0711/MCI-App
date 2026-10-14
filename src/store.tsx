import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { progress } from "./lib/plan";
import type { AppState, CardioLog, ChatMessage, Food, FoodEntry, MobilityLog, Plan, Profile, WorkoutLog } from "./types";

const STORAGE_KEY = "mci-app-state-v1";

export const emptyState: AppState = {
  profile: null,
  plan: null,
  workouts: [],
  cardio: [],
  mobility: [],
  food: [],
  customFoods: [],
  chat: [],
  weightLog: [],
};

export type Action =
  | { type: "setProfile"; profile: Profile }
  | { type: "setPlan"; plan: Plan }
  | { type: "finishWorkout"; log: WorkoutLog }
  | { type: "addCardio"; log: CardioLog }
  | { type: "addMobility"; log: MobilityLog }
  | { type: "addFood"; entry: FoodEntry }
  | { type: "removeFood"; id: string }
  | { type: "addCustomFood"; food: Food }
  | { type: "setChat"; chat: ChatMessage[] }
  | { type: "logWeight"; date: string; kg: number }
  | { type: "reset" };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "setProfile":
      return { ...state, profile: action.profile };
    case "setPlan":
      return { ...state, plan: action.plan };
    case "finishWorkout": {
      if (!state.plan) return state;
      // Progression direkt in den Plan übernehmen
      const days = state.plan.days.map((d) =>
        d.id !== action.log.dayId
          ? d
          : {
              ...d,
              exercises: d.exercises.map((pe) => {
                const logged = action.log.exercises.find((e) => e.exerciseId === pe.exerciseId);
                return logged ? progress(pe, logged.sets, action.log.rpe).planned : pe;
              }),
            },
      );
      const idx = state.plan.days.findIndex((d) => d.id === action.log.dayId);
      return {
        ...state,
        workouts: [...state.workouts, action.log],
        plan: { ...state.plan, days, nextDayIndex: (idx + 1) % state.plan.days.length },
      };
    }
    case "addCardio":
      return { ...state, cardio: [...state.cardio, action.log] };
    case "addMobility":
      return { ...state, mobility: [...state.mobility, action.log] };
    case "addFood":
      return { ...state, food: [...state.food, action.entry] };
    case "removeFood":
      return { ...state, food: state.food.filter((f) => f.id !== action.id) };
    case "addCustomFood":
      return { ...state, customFoods: [...state.customFoods, action.food] };
    case "setChat":
      return { ...state, chat: action.chat };
    case "logWeight": {
      const weightLog = [...state.weightLog.filter((w) => w.date !== action.date), { date: action.date, kg: action.kg }].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      return { ...state, weightLog, profile: state.profile ? { ...state.profile, weightKg: action.kg } : state.profile };
    }
    case "reset":
      return emptyState;
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState;
  } catch {
    return emptyState;
  }
}

const Ctx = createContext<{ state: AppState; dispatch: (a: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Speicher voll oder blockiert – App läuft trotzdem weiter
    }
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore außerhalb von StoreProvider");
  return ctx;
}
