import { useState } from "react";
import { EQUIPMENT_LABEL } from "../data/exercises";
import { generatePlan } from "../lib/plan";
import { today } from "../lib/progress";
import { useStore } from "../store";
import type { Equipment, Goal, Level, Profile } from "../types";

const GOALS: { id: Goal; label: string; icon: string }[] = [
  { id: "muskelaufbau", label: "Muskelaufbau", icon: "💪" },
  { id: "fettabbau", label: "Fett verlieren", icon: "🔥" },
  { id: "kraft", label: "Stärker werden", icon: "🏋️" },
  { id: "fitness", label: "Fit & gesund", icon: "🫀" },
];
const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: "anfaenger", label: "Anfänger", hint: "< 1 Jahr" },
  { id: "fortgeschritten", label: "Fortgeschritten", hint: "1–3 Jahre" },
  { id: "profi", label: "Profi", hint: "> 3 Jahre" },
];
const ACTIVITY = [
  { v: 1.2, label: "Sitzend (Büro, wenig Bewegung)" },
  { v: 1.375, label: "Leicht aktiv" },
  { v: 1.55, label: "Aktiv (viel auf den Beinen)" },
  { v: 1.725, label: "Sehr aktiv (körperliche Arbeit)" },
];
const GYM: Equipment[] = ["langhantel", "kurzhantel", "maschine", "kabel"];

export function Onboarding({ initial, onDone }: { initial?: Profile | null; onDone?: () => void }) {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>(
    initial ?? {
      name: "",
      sex: "m",
      age: 28,
      heightCm: 178,
      weightKg: 78,
      goal: "muskelaufbau",
      level: "anfaenger",
      daysPerWeek: 3,
      sessionMinutes: 60,
      equipment: GYM,
      activity: 1.375,
    },
  );
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));
  const toggleEq = (e: Equipment) => set("equipment", p.equipment.includes(e) ? p.equipment.filter((x) => x !== e) : [...p.equipment, e]);

  const finish = () => {
    dispatch({ type: "setProfile", profile: p });
    dispatch({ type: "setPlan", plan: generatePlan(p) });
    dispatch({ type: "logWeight", date: today(), kg: p.weightKg });
    onDone?.();
  };

  const steps = [
    <div key="0">
      <p className="eyebrow">Willkommen</p>
      <h1 className="screen-title">Dein persönlicher KI-Trainer</h1>
      <p className="muted">Ein paar Fragen – dann bekommst du einen Trainingsplan, Kalorienziele und einen Coach, der dich kennt.</p>
      <label className="field">
        <span>Wie heißt du?</span>
        <input className="input" value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="Vorname" />
      </label>
      <div className="field">
        <span>Geschlecht (für Kalorienberechnung)</span>
        <div className="chips">
          <button className={`chip ${p.sex === "m" ? "on" : ""}`} onClick={() => set("sex", "m")}>Männlich</button>
          <button className={`chip ${p.sex === "w" ? "on" : ""}`} onClick={() => set("sex", "w")}>Weiblich</button>
        </div>
      </div>
      <div className="grid3">
        <label className="field"><span>Alter</span><input className="input" type="number" value={p.age} onChange={(e) => set("age", +e.target.value)} /></label>
        <label className="field"><span>Größe (cm)</span><input className="input" type="number" value={p.heightCm} onChange={(e) => set("heightCm", +e.target.value)} /></label>
        <label className="field"><span>Gewicht (kg)</span><input className="input" type="number" value={p.weightKg} onChange={(e) => set("weightKg", +e.target.value)} /></label>
      </div>
    </div>,
    <div key="1">
      <p className="eyebrow">Schritt 2 von 4</p>
      <h1 className="screen-title">Was ist dein Ziel?</h1>
      <div className="grid2">
        {GOALS.map((g) => (
          <button key={g.id} className={`card btn ${p.goal === g.id ? "primary" : ""}`} style={{ height: 96, flexDirection: "column" }} onClick={() => set("goal", g.id)}>
            <span style={{ fontSize: 28 }}>{g.icon}</span>
            {g.label}
          </button>
        ))}
      </div>
      <h2>Erfahrung</h2>
      <div className="chips">
        {LEVELS.map((l) => (
          <button key={l.id} className={`chip ${p.level === l.id ? "on" : ""}`} onClick={() => set("level", l.id)}>
            {l.label} <span className="small">({l.hint})</span>
          </button>
        ))}
      </div>
    </div>,
    <div key="2">
      <p className="eyebrow">Schritt 3 von 4</p>
      <h1 className="screen-title">Dein Trainingsalltag</h1>
      <label className="field">
        <span>Trainingstage pro Woche: <b>{p.daysPerWeek}</b></span>
        <input type="range" min={1} max={6} value={p.daysPerWeek} onChange={(e) => set("daysPerWeek", +e.target.value)} />
      </label>
      <label className="field">
        <span>Dauer pro Einheit: <b>{p.sessionMinutes} min</b></span>
        <input type="range" min={20} max={90} step={5} value={p.sessionMinutes} onChange={(e) => set("sessionMinutes", +e.target.value)} />
      </label>
      <div className="field">
        <span>Alltagsaktivität</span>
        <div className="stack">
          {ACTIVITY.map((a) => (
            <button key={a.v} className={`chip ${p.activity === a.v ? "on" : ""}`} style={{ width: "100%" }} onClick={() => set("activity", a.v)}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    <div key="3">
      <p className="eyebrow">Schritt 4 von 4</p>
      <h1 className="screen-title">Welches Equipment hast du?</h1>
      <div className="row" style={{ marginBottom: 12, flexWrap: "wrap" }}>
        <button className="btn sm" onClick={() => set("equipment", GYM)}>🏢 Fitnessstudio</button>
        <button className="btn sm" onClick={() => set("equipment", ["kurzhantel", "band"])}>🏠 Zuhause</button>
        <button className="btn sm" onClick={() => set("equipment", [])}>🌳 Nur Körpergewicht</button>
      </div>
      <div className="chips">
        {(Object.keys(EQUIPMENT_LABEL) as Equipment[])
          .filter((e) => e !== "koerpergewicht")
          .map((e) => (
            <button key={e} className={`chip ${p.equipment.includes(e) ? "on" : ""}`} onClick={() => toggleEq(e)}>
              {EQUIPMENT_LABEL[e]}
            </button>
          ))}
      </div>
      <p className="muted small">Körpergewichtsübungen sind immer dabei.</p>
    </div>,
  ];

  const valid = step !== 0 || (p.name.trim() && p.age > 10 && p.heightCm > 100 && p.weightKg > 30);

  return (
    <div className="app">
      <div className="bar" style={{ marginBottom: 16 }}>
        <i style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      {steps[step]}
      <div className="row" style={{ marginTop: 24 }}>
        {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>Zurück</button>}
        {step < steps.length - 1 ? (
          <button className="btn primary block" disabled={!valid} onClick={() => setStep(step + 1)}>Weiter</button>
        ) : (
          <button className="btn primary block" onClick={finish}>{initial ? "Speichern & Plan neu erstellen" : "Plan erstellen 🚀"}</button>
        )}
      </div>
    </div>
  );
}
