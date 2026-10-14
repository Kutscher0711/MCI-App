import { useEffect, useState } from "react";
import { EQUIPMENT_LABEL, EXERCISE_BY_ID, MUSCLE_LABEL } from "../data/exercises";
import { alternativesFor, progress, swapExercise, type ProgressionResult } from "../lib/plan";
import { uid } from "../lib/progress";
import { useStore } from "../store";
import type { LoggedSet, PlanDay, PlannedExercise } from "../types";

const ACTIVE_KEY = "mci-active-workout-v1";

interface ActiveWorkout {
  dayId: string;
  startedAt: number;
  exercises: { exerciseId: string; sets: LoggedSet[] }[];
}

function loadActive(): ActiveWorkout | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveActive(a: ActiveWorkout | null) {
  try {
    if (a) localStorage.setItem(ACTIVE_KEY, JSON.stringify(a));
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // ignorieren
  }
}

const fmtWeight = (kg: number) => (kg === 0 ? "KG" : `${kg} kg`);

export function Training() {
  const { state, dispatch } = useStore();
  const plan = state.plan!;
  const [dayIdx, setDayIdx] = useState(plan.nextDayIndex % plan.days.length);
  const [active, setActive] = useState<ActiveWorkout | null>(loadActive);
  const [summary, setSummary] = useState<{ name: string; results: ProgressionResult[] } | null>(null);
  const [swapFor, setSwapFor] = useState<string | null>(null);
  const day = plan.days[dayIdx];

  useEffect(() => saveActive(active), [active]);

  const start = (d: PlanDay) =>
    setActive({
      dayId: d.id,
      startedAt: Date.now(),
      exercises: d.exercises.map((pe) => ({
        exerciseId: pe.exerciseId,
        sets: Array.from({ length: pe.sets }, () => ({ reps: pe.repMin, weightKg: pe.weightKg, done: false })),
      })),
    });

  const doSwap = (newId: string) => {
    if (!swapFor) return;
    const days = plan.days.map((d) =>
      d.id !== day.id ? d : { ...d, exercises: d.exercises.map((pe) => (pe.exerciseId === swapFor ? swapExercise(pe, newId, state.profile!) : pe)) },
    );
    dispatch({ type: "setPlan", plan: { ...plan, days } });
    setSwapFor(null);
  };

  if (summary) {
    return (
      <>
        <h1 className="screen-title">Stark! 🎉</h1>
        <div className="card hero">
          <h3>{summary.name} abgeschlossen</h3>
          <p className="muted small">+XP gesammelt. Dein Plan wurde automatisch angepasst:</p>
        </div>
        <div className="card">
          {summary.results.map((r) => (
            <div className="ex-row" key={r.planned.exerciseId}>
              <div className="grow">
                <b>{EXERCISE_BY_ID[r.planned.exerciseId]?.name}</b>
                <div className="muted small">{r.note}</div>
              </div>
              <span className={`tag ${r.change === "hoch" ? "up" : r.change === "runter" ? "down" : ""}`}>
                {r.change === "hoch" ? "▲" : r.change === "runter" ? "▼" : "●"} {fmtWeight(r.planned.weightKg)}
              </span>
            </div>
          ))}
        </div>
        <button className="btn primary block" onClick={() => setSummary(null)}>
          Fertig
        </button>
      </>
    );
  }

  if (active) {
    const activeDay = plan.days.find((d) => d.id === active.dayId);
    if (!activeDay) {
      return (
        <div className="card">
          <p>Das laufende Workout gehört zu einem alten Plan.</p>
          <button className="btn block" onClick={() => setActive(null)}>Verwerfen</button>
        </div>
      );
    }
    return (
      <ActiveSession
        day={activeDay}
        active={active}
        onChange={setActive}
        onCancel={() => setActive(null)}
        onFinish={(rpe) => {
          const durationMin = Math.max(1, Math.round((Date.now() - active.startedAt) / 60000));
          const results = activeDay.exercises.map((pe) => {
            const logged = active.exercises.find((e) => e.exerciseId === pe.exerciseId);
            return progress(pe, logged?.sets ?? [], rpe);
          });
          dispatch({
            type: "finishWorkout",
            log: { id: uid(), date: new Date().toISOString(), dayId: activeDay.id, dayName: activeDay.name, durationMin, rpe, exercises: active.exercises },
          });
          setActive(null);
          setSummary({ name: activeDay.name, results });
        }}
      />
    );
  }

  const recent = [...state.workouts].reverse().slice(0, 5);

  return (
    <>
      <p className="eyebrow">{plan.split}</p>
      <h1 className="screen-title">Trainingsplan</h1>
      <div className="seg">
        {plan.days.map((d, i) => (
          <button key={d.id} className={i === dayIdx ? "on" : ""} onClick={() => setDayIdx(i)}>
            {i + 1}
            {i === plan.nextDayIndex % plan.days.length ? " •" : ""}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="row between">
          <div>
            <h3 style={{ fontSize: 20 }}>{day.name}</h3>
            <p className="muted small" style={{ margin: 0 }}>{day.focus}</p>
          </div>
          {dayIdx === plan.nextDayIndex % plan.days.length && <span className="tag up">Als Nächstes</span>}
        </div>
        <div style={{ marginTop: 10 }}>
          {day.exercises.map((pe, i) => (
            <ExerciseRow key={pe.exerciseId} pe={pe} index={i} onSwap={() => setSwapFor(pe.exerciseId)} />
          ))}
        </div>
        <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => start(day)}>
          {day.name} starten ▶
        </button>
      </div>

      {recent.length > 0 && (
        <>
          <h2>Letzte Workouts</h2>
          <div className="card">
            {recent.map((w) => {
              const sets = w.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
              const vol = w.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).reduce((b, s) => b + s.reps * s.weightKg, 0), 0);
              return (
                <div className="ex-row" key={w.id}>
                  <div className="grow">
                    <b>{w.dayName}</b>
                    <div className="muted small">
                      {new Date(w.date).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })} · {w.durationMin} min · {sets} Sätze
                    </div>
                  </div>
                  <span className="tag">{Math.round(vol).toLocaleString("de-DE")} kg</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {swapFor && (
        <div className="modal-bg" onClick={() => setSwapFor(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Übung tauschen</h3>
            <p className="muted small">Alternativen für {EXERCISE_BY_ID[swapFor]?.name} mit deinem Equipment:</p>
            {alternativesFor(swapFor, state.profile!).map((alt) => (
              <button key={alt.id} className="list-btn" onClick={() => doSwap(alt.id)}>
                <span>{alt.name}</span>
                <span className="tag">{EQUIPMENT_LABEL[alt.equipment]}</span>
              </button>
            ))}
            {alternativesFor(swapFor, state.profile!).length === 0 && <p className="muted">Keine Alternativen verfügbar.</p>}
            <button className="btn block" style={{ marginTop: 12 }} onClick={() => setSwapFor(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ExerciseRow({ pe, index, onSwap }: { pe: PlannedExercise; index: number; onSwap: () => void }) {
  const ex = EXERCISE_BY_ID[pe.exerciseId];
  const [open, setOpen] = useState(false);
  if (!ex) return null;
  return (
    <div className="ex-row" style={{ alignItems: "flex-start" }}>
      <div className="ex-badge">{index + 1}</div>
      <div className="grow">
        <button style={{ background: "none", border: 0, padding: 0, cursor: "pointer", textAlign: "left" }} onClick={() => setOpen(!open)}>
          <b>{ex.name}</b>
          <div className="muted small">
            {pe.sets} × {pe.repMin}–{pe.repMax} · {fmtWeight(pe.weightKg)} · {pe.restSec}s Pause
          </div>
        </button>
        {open && (
          <div className="small" style={{ marginTop: 8 }}>
            <div className="chips" style={{ marginBottom: 6 }}>
              <span className="tag">{MUSCLE_LABEL[ex.muscle]}</span>
              {ex.secondary.map((m) => (
                <span key={m} className="tag">{MUSCLE_LABEL[m]}</span>
              ))}
              <span className="tag">{EQUIPMENT_LABEL[ex.equipment]}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }} className="muted">
              {ex.cues.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button className="btn sm ghost" onClick={onSwap} aria-label="Übung tauschen">
        ⇄
      </button>
    </div>
  );
}

function ActiveSession({
  day,
  active,
  onChange,
  onCancel,
  onFinish,
}: {
  day: PlanDay;
  active: ActiveWorkout;
  onChange: (a: ActiveWorkout) => void;
  onCancel: () => void;
  onFinish: (rpe: number) => void;
}) {
  const [rest, setRest] = useState<{ until: number } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [askRpe, setAskRpe] = useState(false);
  const [rpe, setRpe] = useState(7);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (rest && now >= rest.until) {
      setRest(null);
      navigator.vibrate?.(300);
    }
  }, [now, rest]);

  const updateSet = (ei: number, si: number, patch: Partial<LoggedSet>) => {
    const exercises = active.exercises.map((e, i) => (i !== ei ? e : { ...e, sets: e.sets.map((s, j) => (j !== si ? s : { ...s, ...patch })) }));
    onChange({ ...active, exercises });
  };
  const addSet = (ei: number) => {
    const exercises = active.exercises.map((e, i) => (i !== ei ? e : { ...e, sets: [...e.sets, { ...e.sets[e.sets.length - 1], done: false }] }));
    onChange({ ...active, exercises });
  };

  const totalSets = active.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = active.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const elapsed = Math.floor((now - active.startedAt) / 1000);
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <>
      <div className="row between">
        <div>
          <p className="eyebrow">Läuft · {mmss(elapsed)}</p>
          <h1 className="screen-title" style={{ marginBottom: 8 }}>{day.name}</h1>
        </div>
        <button className="btn sm danger" onClick={() => confirm("Workout abbrechen? Fortschritt geht verloren.") && onCancel()}>
          Abbrechen
        </button>
      </div>
      <div className="bar" style={{ marginBottom: 16 }}>
        <i style={{ width: `${(doneSets / Math.max(1, totalSets)) * 100}%` }} />
      </div>

      {active.exercises.map((e, ei) => {
        const ex = EXERCISE_BY_ID[e.exerciseId];
        const pe = day.exercises.find((p) => p.exerciseId === e.exerciseId);
        return (
          <div className="card" key={e.exerciseId}>
            <div className="row between">
              <h3>{ex?.name}</h3>
              <span className="tag">
                Ziel {pe?.repMin}–{pe?.repMax}
              </span>
            </div>
            {ex && <p className="muted small" style={{ margin: "2px 0 0" }}>{ex.cues[0]}</p>}
            <table className="set-table">
              <thead>
                <tr>
                  <th>Satz</th>
                  <th>{ex?.id === "plank" ? "Sek." : "Wdh."}</th>
                  <th>kg</th>
                  <th>✓</th>
                </tr>
              </thead>
              <tbody>
                {e.sets.map((s, si) => (
                  <tr key={si}>
                    <td className="muted">{si + 1}</td>
                    <td>
                      <input className="input" type="number" inputMode="numeric" value={s.reps} onChange={(ev) => updateSet(ei, si, { reps: +ev.target.value })} />
                    </td>
                    <td>
                      <input className="input" type="number" inputMode="decimal" step="0.5" value={s.weightKg} onChange={(ev) => updateSet(ei, si, { weightKg: +ev.target.value })} />
                    </td>
                    <td>
                      <button
                        className={`check ${s.done ? "on" : ""}`}
                        onClick={() => {
                          updateSet(ei, si, { done: !s.done });
                          if (!s.done && pe) setRest({ until: Date.now() + pe.restSec * 1000 });
                        }}
                      >
                        ✓
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn sm ghost" onClick={() => addSet(ei)}>
              + Satz
            </button>
          </div>
        );
      })}

      <button className="btn primary block" disabled={doneSets === 0} onClick={() => setAskRpe(true)}>
        Workout beenden ({doneSets}/{totalSets} Sätze)
      </button>

      {rest && (
        <div className="timer">
          ⏱ Pause {mmss(Math.max(0, Math.ceil((rest.until - now) / 1000)))}
          <button onClick={() => setRest({ until: rest.until + 15000 })}>+15s</button>
          <button onClick={() => setRest(null)}>Skip</button>
        </div>
      )}

      {askRpe && (
        <div className="modal-bg" onClick={() => setAskRpe(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Wie anstrengend war's?</h3>
            <p className="muted small">RPE 1 = ganz locker · 10 = absolutes Maximum. Hilft bei der automatischen Plananpassung.</p>
            <div style={{ fontSize: 40, textAlign: "center", fontWeight: 800 }}>{rpe}</div>
            <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(+e.target.value)} />
            <button className="btn primary block" style={{ marginTop: 16 }} onClick={() => onFinish(rpe)}>
              Speichern
            </button>
          </div>
        </div>
      )}
    </>
  );
}
