import { useState } from "react";
import { ConfirmButton } from "../components/ConfirmButton";
import { isArtifact } from "../lib/platform";
import { generatePlan } from "../lib/plan";
import { badges, computeXp, levelFromXp, rankFor, today, totalVolume, weekStreak } from "../lib/progress";
import { targets } from "../lib/nutrition";
import { useStore } from "../store";
import { Onboarding } from "./Onboarding";

const GOAL_LABEL = { muskelaufbau: "Muskelaufbau", fettabbau: "Fettabbau", kraft: "Kraft", fitness: "Fitness" };

export function ProfileScreen() {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState("");
  const p = state.profile!;

  if (editing) return <Onboarding initial={p} onDone={() => setEditing(false)} />;

  const xp = computeXp(state);
  const lvl = levelFromXp(xp);
  const t = targets(p);
  const list = badges(state);
  const weights = state.weightLog.slice(-12);
  const min = Math.min(...weights.map((w) => w.kg)) - 1;
  const max = Math.max(...weights.map((w) => w.kg)) + 1;

  return (
    <>
      <h1 className="screen-title">{p.name}</h1>
      <div className="card hero">
        <div className="row between">
          <div>
            <p className="eyebrow">Level {lvl.level}</p>
            <h3 style={{ fontSize: 22 }}>{rankFor(lvl.level)}</h3>
          </div>
          <span className="tag up">{GOAL_LABEL[p.goal]}</span>
        </div>
      </div>

      <div className="grid3">
        <div className="stat"><b>{state.workouts.length}</b><span>Workouts</span></div>
        <div className="stat"><b>{Math.round(totalVolume(state) / 1000).toLocaleString("de-DE")} t</b><span>Volumen</span></div>
        <div className="stat"><b>🔥 {weekStreak(state)}</b><span>Wochen-Streak</span></div>
      </div>

      <h2>Abzeichen</h2>
      <div className="grid3">
        {list.map((b) => (
          <div key={b.id} className={`badge ${b.earned ? "" : "off"}`} title={b.desc}>
            <div className="ic">{b.icon}</div>
            <div>{b.name}</div>
          </div>
        ))}
      </div>

      <h2>Körpergewicht</h2>
      <div className="card">
        {weights.length > 1 && (
          <svg viewBox="0 0 300 80" width="100%" height="80" role="img" aria-label="Gewichtsverlauf">
            <polyline
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              points={weights.map((w, i) => `${(i / (weights.length - 1)) * 290 + 5},${75 - ((w.kg - min) / (max - min)) * 70}`).join(" ")}
            />
          </svg>
        )}
        <div className="row">
          <input className="input" inputMode="decimal" placeholder={`${p.weightKg} kg`} value={weight} onChange={(e) => setWeight(e.target.value)} />
          <button
            className="btn primary"
            disabled={!(+weight.replace(",", ".") > 30)}
            onClick={() => {
              dispatch({ type: "logWeight", date: today(), kg: +weight.replace(",", ".") });
              setWeight("");
            }}
          >
            Eintragen
          </button>
        </div>
      </div>

      <h2>Deine Daten</h2>
      <div className="card small stack">
        <div className="row between"><span className="muted">Alter / Größe / Gewicht</span><span>{p.age} J · {p.heightCm} cm · {p.weightKg} kg</span></div>
        <div className="row between"><span className="muted">Training</span><span>{p.daysPerWeek}× / Woche · {p.sessionMinutes} min</span></div>
        <div className="row between"><span className="muted">Kalorienziel</span><span>{t.kcal} kcal · {t.protein} g Protein</span></div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn block" onClick={() => setEditing(true)}>Profil bearbeiten</button>
          <ConfirmButton className="btn block" confirmLabel="Gewichte zurücksetzen?" onConfirm={() => dispatch({ type: "setPlan", plan: generatePlan(p) })}>
            Plan neu erstellen
          </ConfirmButton>
        </div>
      </div>

      <ConfirmButton className="btn ghost danger block" confirmLabel="Tippen, um wirklich alles zu löschen" onConfirm={() => dispatch({ type: "reset" })}>
        Alle Daten löschen
      </ConfirmButton>
      <p className="muted small" style={{ textAlign: "center" }}>
        {isArtifact
          ? "Deine Daten werden privat in deinem Claude-Konto gespeichert und sind nur für dich sichtbar. Wenn du den KI-Coach nutzt, wird ein Auszug davon an Claude gesendet."
          : "Deine Daten werden lokal auf diesem Gerät gespeichert. Nur wenn du den KI-Coach nutzt, wird ein Auszug davon zur Beantwortung an die KI gesendet."}
      </p>
    </>
  );
}
