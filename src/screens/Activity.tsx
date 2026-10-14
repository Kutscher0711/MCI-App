import { useEffect, useState } from "react";
import { ACTIVITY_BY_ID, CARDIO_ACTIVITIES, MOBILITY_ROUTINES, type MobilityRoutine } from "../data/activities";
import { cardioKcal } from "../lib/nutrition";
import { uid, weekKey } from "../lib/progress";
import { useStore } from "../store";

export function Activity() {
  const [mode, setMode] = useState<"cardio" | "mobility">("cardio");
  return (
    <>
      <h1 className="screen-title">Cardio & Mobility</h1>
      <div className="seg">
        <button className={mode === "cardio" ? "on" : ""} onClick={() => setMode("cardio")}>🏃 Cardio</button>
        <button className={mode === "mobility" ? "on" : ""} onClick={() => setMode("mobility")}>🧘 Mobility</button>
      </div>
      {mode === "cardio" ? <Cardio /> : <Mobility />}
    </>
  );
}

function Cardio() {
  const { state, dispatch } = useStore();
  const [activityId, setActivityId] = useState<string>("laufen");
  const [minutes, setMinutes] = useState(30);
  const [distance, setDistance] = useState("");
  const act = ACTIVITY_BY_ID[activityId];
  const kcal = cardioKcal(act.met, state.profile!.weightKg, minutes);
  const thisWeek = state.cardio.filter((c) => weekKey(c.date) === weekKey(new Date().toISOString()));
  const weekMin = thisWeek.reduce((a, c) => a + c.minutes, 0);

  const save = () => {
    dispatch({
      type: "addCardio",
      log: { id: uid(), date: new Date().toISOString(), activityId, minutes, distanceKm: distance ? +distance.replace(",", ".") : undefined, kcal },
    });
    setDistance("");
  };

  return (
    <>
      <div className="card">
        <div className="row between">
          <div>
            <p className="eyebrow">Diese Woche</p>
            <b style={{ fontSize: 22 }}>{weekMin} / 150 min</b>
          </div>
          <span className="muted small">WHO-Empfehlung: 150 min moderat</span>
        </div>
        <div className="bar" style={{ marginTop: 8 }}>
          <i style={{ width: `${Math.min(100, (weekMin / 150) * 100)}%`, background: "var(--blue)" }} />
        </div>
      </div>

      <div className="card">
        <h3>Einheit eintragen</h3>
        <div className="chips" style={{ margin: "10px 0 14px" }}>
          {CARDIO_ACTIVITIES.map((a) => (
            <button key={a.id} className={`chip ${a.id === activityId ? "on" : ""}`} onClick={() => setActivityId(a.id)}>
              {a.icon} {a.name}
            </button>
          ))}
        </div>
        <div className="grid2">
          <label className="field">
            <span>Dauer (min)</span>
            <input className="input" type="number" value={minutes} onChange={(e) => setMinutes(Math.max(0, +e.target.value))} />
          </label>
          <label className="field">
            <span>Distanz (km, optional)</span>
            <input className="input" inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} />
          </label>
        </div>
        <p className="muted small">≈ {kcal} kcal verbrannt (MET {act.met})</p>
        <button className="btn primary block" disabled={minutes <= 0} onClick={save}>
          Speichern (+{minutes * 2} XP)
        </button>
      </div>

      {state.cardio.length > 0 && (
        <>
          <h2>Verlauf</h2>
          <div className="card">
            {[...state.cardio].reverse().slice(0, 10).map((c) => (
              <div className="ex-row" key={c.id}>
                <div className="ex-badge" style={{ fontSize: 20 }}>{ACTIVITY_BY_ID[c.activityId]?.icon}</div>
                <div className="grow">
                  <b>{ACTIVITY_BY_ID[c.activityId]?.name}</b>
                  <div className="muted small">
                    {new Date(c.date).toLocaleDateString("de-DE", { day: "numeric", month: "short" })} · {c.minutes} min
                    {c.distanceKm ? ` · ${c.distanceKm} km` : ""}
                  </div>
                </div>
                <span className="tag">{c.kcal} kcal</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Mobility() {
  const { state } = useStore();
  const [running, setRunning] = useState<MobilityRoutine | null>(null);
  if (running) return <MobilityPlayer routine={running} onClose={() => setRunning(null)} />;
  const counts = state.mobility.reduce<Record<string, number>>((a, m) => ({ ...a, [m.routineId]: (a[m.routineId] ?? 0) + 1 }), {});
  return (
    <>
      <p className="muted">Geführte Routinen zur Verletzungsprävention und Regeneration. Ideal an Ruhetagen oder nach dem Training.</p>
      {MOBILITY_ROUTINES.map((r) => (
        <div className="card" key={r.id}>
          <div className="row between">
            <div>
              <h3>{r.name}</h3>
              <p className="muted small" style={{ margin: 0 }}>
                {r.area} · {r.minutes} min · {r.steps.length} Übungen{counts[r.id] ? ` · ${counts[r.id]}× gemacht` : ""}
              </p>
            </div>
            <button className="btn primary sm" onClick={() => setRunning(r)}>
              Start
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

function MobilityPlayer({ routine, onClose }: { routine: MobilityRoutine; onClose: () => void }) {
  const { dispatch } = useStore();
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(routine.steps[0].seconds);
  const [paused, setPaused] = useState(false);
  const done = i >= routine.steps.length;

  useEffect(() => {
    if (done || paused) return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [done, paused, i]);

  useEffect(() => {
    if (left > 0 || done) return;
    navigator.vibrate?.(200);
    const next = i + 1;
    setI(next);
    if (next < routine.steps.length) setLeft(routine.steps[next].seconds);
  }, [left, done, i, routine.steps]);

  if (done) {
    return (
      <div className="card hero" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>🧘</div>
        <h3>{routine.name} geschafft!</h3>
        <p className="muted">+30 XP</p>
        <button
          className="btn primary block"
          onClick={() => {
            dispatch({ type: "addMobility", log: { id: uid(), date: new Date().toISOString(), routineId: routine.id } });
            onClose();
          }}
        >
          Speichern
        </button>
      </div>
    );
  }

  const step = routine.steps[i];
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <p className="eyebrow">
        {routine.name} · {i + 1}/{routine.steps.length}
      </p>
      <h2 style={{ fontSize: 24 }}>{step.name}</h2>
      <p className="muted">{step.hint}</p>
      <div style={{ fontSize: 56, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
        {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
      </div>
      <div className="bar" style={{ margin: "12px 0 16px" }}>
        <i style={{ width: `${(1 - left / step.seconds) * 100}%` }} />
      </div>
      <div className="row">
        <button className="btn" onClick={onClose}>Beenden</button>
        <button className="btn block" onClick={() => setPaused(!paused)}>{paused ? "▶ Weiter" : "⏸ Pause"}</button>
        <button className="btn" onClick={() => setLeft(0)}>⏭</button>
      </div>
    </div>
  );
}
