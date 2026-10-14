import type { Tab } from "../App";
import { MacroBar, Ring } from "../components/Ring";
import { FOODS, MOBILITY_ROUTINES } from "../data/activities";
import { EXERCISE_BY_ID } from "../data/exercises";
import { sumEntries, targets } from "../lib/nutrition";
import { computeXp, levelFromXp, rankFor, today, weekStreak, workoutsThisWeek } from "../lib/progress";
import { useStore } from "../store";

export function Home({ go }: { go: (t: Tab) => void }) {
  const { state } = useStore();
  const profile = state.profile!;
  const plan = state.plan!;
  const next = plan.days[plan.nextDayIndex % plan.days.length];
  const xp = computeXp(state);
  const lvl = levelFromXp(xp);
  const streak = weekStreak(state);
  const week = workoutsThisWeek(state);
  const t = targets(profile);
  const foods = Object.fromEntries([...FOODS, ...state.customFoods].map((f) => [f.id, f]));
  const eaten = sumEntries(state.food.filter((f) => f.date === today()), foods);
  const burned = state.cardio.filter((c) => c.date.slice(0, 10) === today()).reduce((a, c) => a + c.kcal, 0);
  const mobilityTip = MOBILITY_ROUTINES[new Date().getDate() % MOBILITY_ROUTINES.length];
  const hour = new Date().getHours();
  const greet = hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  return (
    <>
      <p className="eyebrow">{new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</p>
      <h1 className="screen-title">
        {greet}, {profile.name || "Athlet"} 👋
      </h1>

      <div className="card hero">
        <div className="row between">
          <div>
            <p className="eyebrow">Level {lvl.level} · {rankFor(lvl.level)}</p>
            <h3 style={{ fontSize: 22 }}>{xp.toLocaleString("de-DE")} XP</h3>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24 }}>🔥 {streak}</div>
            <span className="muted small">Wochen-Streak</span>
          </div>
        </div>
        <div className="bar" style={{ marginTop: 12 }}>
          <i style={{ width: `${lvl.progress * 100}%` }} />
        </div>
        <p className="muted small" style={{ margin: "6px 0 0" }}>
          Noch {lvl.next - xp} XP bis Level {lvl.level + 1}
        </p>
      </div>

      <div className="card">
        <div className="row between">
          <div>
            <p className="eyebrow">Nächstes Workout</p>
            <h3 style={{ fontSize: 20 }}>{next.name}</h3>
            <p className="muted small" style={{ margin: 0 }}>
              {next.focus} · {next.exercises.length} Übungen · ~{profile.sessionMinutes} min
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <b style={{ fontSize: 22 }}>
              {week}/{profile.daysPerWeek}
            </b>
            <div className="muted small">diese Woche</div>
          </div>
        </div>
        <div style={{ margin: "12px 0" }} className="chips">
          {next.exercises.slice(0, 4).map((e) => (
            <span key={e.exerciseId} className="tag">
              {EXERCISE_BY_ID[e.exerciseId]?.name}
            </span>
          ))}
          {next.exercises.length > 4 && <span className="tag">+{next.exercises.length - 4}</span>}
        </div>
        <button className="btn primary block" onClick={() => go("training")}>
          Workout starten ▶
        </button>
      </div>

      <div className="card">
        <div className="row">
          <Ring value={eaten.kcal} max={t.kcal + burned} label={`${Math.max(0, Math.round(t.kcal + burned - eaten.kcal))}`} sub="kcal übrig" />
          <div className="grow stack">
            <MacroBar label="Protein" value={eaten.protein} max={t.protein} color="var(--pink)" />
            <MacroBar label="Kohlenhydrate" value={eaten.carbs} max={t.carbs} color="var(--blue)" />
            <MacroBar label="Fett" value={eaten.fat} max={t.fat} color="var(--orange)" />
          </div>
        </div>
        <button className="btn block" style={{ marginTop: 12 }} onClick={() => go("nutrition")}>
          Mahlzeit eintragen
        </button>
      </div>

      <div className="grid2">
        <button className="card btn" style={{ flexDirection: "column", alignItems: "flex-start", height: "auto" }} onClick={() => go("activity")}>
          <span className="eyebrow">Mobility-Tipp</span>
          <b>🧘 {mobilityTip.name}</b>
          <span className="muted small">{mobilityTip.minutes} min · {mobilityTip.area}</span>
        </button>
        <button className="card btn" style={{ flexDirection: "column", alignItems: "flex-start", height: "auto" }} onClick={() => go("coach")}>
          <span className="eyebrow">KI-Coach</span>
          <b>🤖 Frag deinen Coach</b>
          <span className="muted small">Training, Ernährung, Technik</span>
        </button>
      </div>
    </>
  );
}
