import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from "react";
import { progress } from "./lib/plan";
import { capability, isArtifact, type Db, type UserCap } from "./lib/platform";
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
  | { type: "reset" }
  | { type: "hydrate"; state: Partial<AppState> };

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
    case "hydrate":
      return { ...state, ...action.state };
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

const KEYS = Object.keys(emptyState) as (keyof AppState)[];

/**
 * Als claude.ai-Artifact ist localStorage nicht dauerhaft verlässlich. Dort wird
 * jeder State-Bereich zusätzlich als privates Dokument unter data/users/<id>/
 * gesichert und beim Start wiederhergestellt.
 */
function useArtifactSync(state: AppState, dispatch: (a: Action) => void) {
  const remote = useRef<{ db: Db; base: string } | null>(null);
  const written = useRef<Partial<Record<keyof AppState, string>>>({});
  const ready = useRef(false);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    if (!isArtifact) return;
    let cancelled = false;
    (async () => {
      const [db, user] = await Promise.all([capability<Db>("db"), capability<UserCap>("user")]);
      const id = await user?.id().catch(() => null);
      if (!db || !id || cancelled) return;
      const base = `data/users/${id}/`;
      const restored: Partial<AppState> = {};
      try {
        const snaps = await Promise.all(KEYS.map((k) => db.doc(base + k).get()));
        snaps.forEach((snap, i) => {
          const body = snap.exists ? snap.data() : undefined;
          if (body && "v" in body) {
            (restored as Record<string, unknown>)[KEYS[i]] = body.v;
            written.current[KEYS[i]] = JSON.stringify(body.v);
          }
        });
      } catch {
        return; // ohne Sicherung weiterarbeiten
      }
      if (cancelled) return;
      remote.current = { db, base };
      // Hat das Konto schon Daten, gewinnen sie (z. B. neues Gerät); sonst lokalen Stand hochladen.
      if (restored.profile) dispatch({ type: "hydrate", state: restored });
      ready.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isArtifact) return;
    const t = setTimeout(async () => {
      const r = remote.current;
      if (!r || !ready.current) return;
      for (const k of KEYS) {
        const json = JSON.stringify(latest.current[k]);
        if (written.current[k] === json) continue;
        try {
          await r.db.doc(r.base + k).set({ v: JSON.parse(json) });
          written.current[k] = json;
        } catch {
          // nächster Änderungsdurchlauf versucht es erneut
        }
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [state]);
}

const Ctx = createContext<{ state: AppState; dispatch: (a: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useArtifactSync(state, dispatch);
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
