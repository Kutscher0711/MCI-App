import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { ACTIVITY_BY_ID, FOODS } from "../data/activities";
import { EXERCISE_BY_ID } from "../data/exercises";
import { sumEntries, targets } from "../lib/nutrition";
import { computeXp, levelFromXp, today, weekKey, weekStreak } from "../lib/progress";
import { useStore } from "../store";
import type { AppState, ChatMessage } from "../types";

const QUICK = [
  "Wie lief meine letzte Trainingswoche?",
  "Was soll ich heute nach dem Training essen?",
  "Ich habe Knieschmerzen bei Kniebeugen – Alternativen?",
  "Wie komme ich aus meinem Plateau beim Bankdrücken?",
];

/** Kompakter Datenauszug für den Coach – nur, was er für gute Antworten braucht. */
export function buildContext(state: AppState) {
  const p = state.profile!;
  const foods = Object.fromEntries([...FOODS, ...state.customFoods].map((f) => [f.id, f]));
  const todayFood = sumEntries(state.food.filter((f) => f.date === today()), foods);
  const wk = weekKey(new Date().toISOString());
  return {
    datum: today(),
    profil: p,
    kalorienziele: targets(p),
    level: levelFromXp(computeXp(state)).level,
    wochenStreak: weekStreak(state),
    plan: state.plan && {
      split: state.plan.split,
      naechsterTag: state.plan.days[state.plan.nextDayIndex]?.name,
      tage: state.plan.days.map((d) => ({
        name: d.name,
        uebungen: d.exercises.map((e) => `${EXERCISE_BY_ID[e.exerciseId]?.name}: ${e.sets}×${e.repMin}-${e.repMax} @ ${e.weightKg || "KG"}${e.weightKg ? " kg" : ""}`),
      })),
    },
    letzteWorkouts: state.workouts.slice(-5).map((w) => ({
      datum: w.date.slice(0, 10),
      tag: w.dayName,
      dauerMin: w.durationMin,
      rpe: w.rpe,
      saetze: w.exercises.map((e) => `${EXERCISE_BY_ID[e.exerciseId]?.name}: ${e.sets.filter((s) => s.done).map((s) => `${s.reps}×${s.weightKg}kg`).join(", ") || "–"}`),
    })),
    cardioDieseWoche: state.cardio
      .filter((c) => weekKey(c.date) === wk)
      .map((c) => `${ACTIVITY_BY_ID[c.activityId]?.name} ${c.minutes} min`),
    ernaehrungHeute: { kcal: Math.round(todayFood.kcal), protein: Math.round(todayFood.protein), kh: Math.round(todayFood.carbs), fett: Math.round(todayFood.fat) },
    gewichtsverlauf: state.weightLog.slice(-8),
  };
}

/** Minimales Markdown: **fett** und Listenpunkte */
function renderText(text: string): ReactNode {
  return text.split("\n").map((line, i) => {
    const bullet = /^\s*[-*]\s+/.test(line);
    const content = line.replace(/^\s*[-*]\s+/, "").replace(/^#+\s*/, "");
    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith("**") && part.endsWith("**") ? <b key={j}>{part.slice(2, -2)}</b> : <Fragment key={j}>{part}</Fragment>,
    );
    return (
      <div key={i} style={bullet ? { paddingLeft: 14, textIndent: -10 } : undefined}>
        {bullet ? "• " : ""}
        {parts}
        {!content && " "}
      </div>
    );
  });
}

export function Coach() {
  const { state, dispatch } = useStore();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [state.chat.length, draft]);
  useEffect(() => () => abort.current?.abort(), []);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const history: ChatMessage[] = [...state.chat, { role: "user", content }];
    dispatch({ type: "setChat", chat: history });
    setInput("");
    setError("");
    setBusy(true);
    setDraft("");
    abort.current = new AbortController();

    let answer = "";
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: buildContext(state) }),
        signal: abort.current.signal,
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Fehler ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() ?? "";
        for (const ev of events) {
          const type = /^event: (.+)$/m.exec(ev)?.[1];
          const data = JSON.parse(/^data: (.+)$/m.exec(ev)?.[1] ?? "{}");
          if (type === "delta") {
            answer += data.text;
            setDraft(answer);
          } else if (type === "error") {
            setError(data.error);
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message || "Coach nicht erreichbar.");
    } finally {
      if (answer) dispatch({ type: "setChat", chat: [...history, { role: "assistant", content: answer }] });
      setDraft("");
      setBusy(false);
    }
  };

  return (
    <>
      <div className="row between">
        <h1 className="screen-title">KI-Coach</h1>
        {state.chat.length > 0 && (
          <button className="btn sm ghost" onClick={() => dispatch({ type: "setChat", chat: [] })}>
            Neuer Chat
          </button>
        )}
      </div>

      {state.chat.length === 0 && !busy && (
        <div className="card hero">
          <h3>Hi {state.profile?.name}! 🤖</h3>
          <p className="muted small" style={{ marginBottom: 12 }}>
            Ich kenne deinen Plan, deine Workouts und deine Ernährung. Frag mich alles rund um Training, Technik, Ernährung und Regeneration.
          </p>
          <div className="stack">
            {QUICK.map((q) => (
              <button key={q} className="chip" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat">
        {state.chat.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.role === "assistant" ? renderText(m.content) : m.content}
          </div>
        ))}
        {busy && <div className="bubble assistant">{draft ? renderText(draft) : <span className="muted">Coach denkt nach…</span>}</div>}
        {error && <div className="bubble assistant" style={{ borderColor: "var(--danger)" }}>⚠️ {error}</div>}
        <div ref={bottom} />
      </div>

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input className="input" placeholder="Frag deinen Coach…" value={input} onChange={(e) => setInput(e.target.value)} disabled={busy} />
        <button className="btn primary" disabled={busy || !input.trim()}>
          ➤
        </button>
      </form>
      <p className="muted small" style={{ textAlign: "center" }}>Der Coach ersetzt keine ärztliche Beratung.</p>
    </>
  );
}
