import { useMemo, useState } from "react";
import { MacroBar, Ring } from "../components/Ring";
import { FOODS } from "../data/activities";
import { macrosFor, sumEntries, targets } from "../lib/nutrition";
import { today, uid } from "../lib/progress";
import { useStore } from "../store";
import type { Food, Meal } from "../types";

const MEALS: { id: Meal; label: string; icon: string }[] = [
  { id: "fruehstueck", label: "Frühstück", icon: "🌅" },
  { id: "mittag", label: "Mittagessen", icon: "☀️" },
  { id: "abend", label: "Abendessen", icon: "🌙" },
  { id: "snack", label: "Snacks", icon: "🍎" },
];

export function Nutrition() {
  const { state, dispatch } = useStore();
  const [date, setDate] = useState(today());
  const [addTo, setAddTo] = useState<Meal | null>(null);
  const t = targets(state.profile!);
  const allFoods = useMemo(() => [...state.customFoods, ...FOODS], [state.customFoods]);
  const foodsById = useMemo(() => Object.fromEntries(allFoods.map((f) => [f.id, f])), [allFoods]);
  const entries = state.food.filter((f) => f.date === date);
  const sum = sumEntries(entries, foodsById);
  const burned = state.cardio.filter((c) => c.date.slice(0, 10) === date).reduce((a, c) => a + c.kcal, 0);
  const goal = t.kcal + burned;

  const shift = (days: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().slice(0, 10));
  };

  return (
    <>
      <h1 className="screen-title">Ernährung</h1>
      <div className="row between" style={{ marginBottom: 12 }}>
        <button className="btn sm" onClick={() => shift(-1)}>‹</button>
        <b>{date === today() ? "Heute" : new Date(date + "T12:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "short" })}</b>
        <button className="btn sm" disabled={date >= today()} onClick={() => shift(1)}>›</button>
      </div>

      <div className="card">
        <div className="row">
          <Ring value={sum.kcal} max={goal} label={`${Math.round(sum.kcal)}`} sub={`von ${goal} kcal`} />
          <div className="grow stack">
            <MacroBar label="Protein" value={sum.protein} max={t.protein} color="var(--pink)" />
            <MacroBar label="Kohlenhydrate" value={sum.carbs} max={t.carbs} color="var(--blue)" />
            <MacroBar label="Fett" value={sum.fat} max={t.fat} color="var(--orange)" />
          </div>
        </div>
        <p className="muted small" style={{ marginBottom: 0 }}>
          Grundumsatz {t.bmr} · Gesamtumsatz {t.tdee} kcal · Ziel {t.kcal} kcal
          {burned > 0 ? ` + ${burned} kcal Cardio` : ""}
        </p>
      </div>

      {MEALS.map((m) => {
        const list = entries.filter((e) => e.meal === m.id);
        const mealKcal = sumEntries(list, foodsById).kcal;
        return (
          <div className="card" key={m.id}>
            <div className="row between">
              <h3>
                {m.icon} {m.label}
              </h3>
              <div className="row">
                <span className="muted small">{Math.round(mealKcal)} kcal</span>
                <button className="btn sm primary" onClick={() => setAddTo(m.id)} aria-label={`${m.label} hinzufügen`}>
                  +
                </button>
              </div>
            </div>
            {list.map((e) => {
              const f = foodsById[e.foodId];
              if (!f) return null;
              return (
                <div className="ex-row" key={e.id}>
                  <div className="grow">
                    {f.name}
                    <div className="muted small">
                      {e.grams} g · {Math.round(macrosFor(f, e.grams).protein)} g Protein
                    </div>
                  </div>
                  <span className="small">{Math.round(macrosFor(f, e.grams).kcal)} kcal</span>
                  <button className="btn sm ghost" onClick={() => dispatch({ type: "removeFood", id: e.id })} aria-label="Entfernen">
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}

      {addTo && <AddFood meal={addTo} date={date} foods={allFoods} onClose={() => setAddTo(null)} />}
    </>
  );
}

async function lookupBarcode(code: string): Promise<Food | null> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,nutriments`);
  if (!res.ok) return null;
  const data = await res.json();
  const n = data?.product?.nutriments;
  if (data?.status !== 1 || !n) return null;
  return {
    id: `off-${code}`,
    name: data.product.product_name || `Produkt ${code}`,
    kcal: Math.round(n["energy-kcal_100g"] ?? (n["energy_100g"] ?? 0) / 4.184),
    protein: +(n.proteins_100g ?? 0),
    carbs: +(n.carbohydrates_100g ?? 0),
    fat: +(n.fat_100g ?? 0),
  };
}

function AddFood({ meal, date, foods, onClose }: { meal: Meal; date: string; foods: Food[]; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Food | null>(null);
  const [grams, setGrams] = useState(100);
  const [mode, setMode] = useState<"search" | "barcode" | "custom">("search");
  const [barcode, setBarcode] = useState("");
  const [status, setStatus] = useState("");
  const [custom, setCustom] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "" });

  const results = foods.filter((f) => f.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 30);

  const add = (food: Food) => {
    if (!state.customFoods.some((f) => f.id === food.id) && !FOODS.some((f) => f.id === food.id)) {
      dispatch({ type: "addCustomFood", food });
    }
    dispatch({ type: "addFood", entry: { id: uid(), date, meal, foodId: food.id, grams } });
    onClose();
  };

  const scan = async () => {
    setStatus("Suche…");
    try {
      const food = await lookupBarcode(barcode.trim());
      if (food) {
        setPicked(food);
        setStatus("");
      } else setStatus("Produkt nicht gefunden.");
    } catch {
      setStatus("Keine Verbindung zu Open Food Facts.");
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {picked ? (
          <>
            <h3>{picked.name}</h3>
            <p className="muted small">
              pro 100 g: {picked.kcal} kcal · P {picked.protein} · K {picked.carbs} · F {picked.fat}
            </p>
            <label className="field">
              <span>Menge (g)</span>
              <input className="input" type="number" value={grams} onChange={(e) => setGrams(Math.max(0, +e.target.value))} autoFocus />
            </label>
            <div className="chips" style={{ marginBottom: 12 }}>
              {[50, 100, 150, 200, 250].map((g) => (
                <button key={g} className={`chip ${grams === g ? "on" : ""}`} onClick={() => setGrams(g)}>
                  {g} g
                </button>
              ))}
            </div>
            <p>
              <b>{Math.round(macrosFor(picked, grams).kcal)} kcal</b> · {Math.round(macrosFor(picked, grams).protein)} g Protein
            </p>
            <div className="row">
              <button className="btn" onClick={() => setPicked(null)}>Zurück</button>
              <button className="btn primary block" disabled={grams <= 0} onClick={() => add(picked)}>
                Hinzufügen
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="seg">
              <button className={mode === "search" ? "on" : ""} onClick={() => setMode("search")}>Suche</button>
              <button className={mode === "barcode" ? "on" : ""} onClick={() => setMode("barcode")}>Barcode</button>
              <button className={mode === "custom" ? "on" : ""} onClick={() => setMode("custom")}>Eigenes</button>
            </div>
            {mode === "search" && (
              <>
                <input className="input" placeholder="Lebensmittel suchen…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
                <div style={{ marginTop: 8 }}>
                  {results.map((f) => (
                    <button key={f.id} className="list-btn" onClick={() => setPicked(f)}>
                      <span>{f.name}</span>
                      <span className="muted small">{f.kcal} kcal/100 g</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {mode === "barcode" && (
              <>
                <p className="muted small">EAN-Nummer eingeben – Nährwerte kommen aus der offenen Datenbank Open Food Facts.</p>
                <div className="row">
                  <input className="input" inputMode="numeric" placeholder="z. B. 4008400401621" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
                  <button className="btn primary" disabled={barcode.trim().length < 6} onClick={scan}>
                    Suchen
                  </button>
                </div>
                {status && <p className="muted small">{status}</p>}
              </>
            )}
            {mode === "custom" && (
              <>
                <label className="field">
                  <span>Name</span>
                  <input className="input" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} />
                </label>
                <div className="grid2">
                  {(["kcal", "protein", "carbs", "fat"] as const).map((k) => (
                    <label className="field" key={k}>
                      <span>{{ kcal: "kcal", protein: "Protein (g)", carbs: "Kohlenhydrate (g)", fat: "Fett (g)" }[k]} / 100 g</span>
                      <input className="input" inputMode="decimal" value={custom[k]} onChange={(e) => setCustom({ ...custom, [k]: e.target.value })} />
                    </label>
                  ))}
                </div>
                <button
                  className="btn primary block"
                  disabled={!custom.name.trim() || !custom.kcal}
                  onClick={() => {
                    const num = (v: string) => +v.replace(",", ".") || 0;
                    setPicked({ id: `custom-${uid()}`, name: custom.name.trim(), kcal: num(custom.kcal), protein: num(custom.protein), carbs: num(custom.carbs), fat: num(custom.fat) });
                  }}
                >
                  Weiter
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
