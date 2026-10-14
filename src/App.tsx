import { useState } from "react";
import { Activity } from "./screens/Activity";
import { Coach } from "./screens/Coach";
import { Home } from "./screens/Home";
import { Nutrition } from "./screens/Nutrition";
import { Onboarding } from "./screens/Onboarding";
import { ProfileScreen } from "./screens/Profile";
import { Training } from "./screens/Training";
import { useStore } from "./store";

export type Tab = "home" | "training" | "activity" | "nutrition" | "coach" | "profile";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Heute", icon: "🏠" },
  { id: "training", label: "Training", icon: "🏋️" },
  { id: "activity", label: "Cardio", icon: "🏃" },
  { id: "nutrition", label: "Essen", icon: "🥗" },
  { id: "coach", label: "Coach", icon: "🤖" },
  { id: "profile", label: "Profil", icon: "👤" },
];

export default function App() {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>("home");

  if (!state.profile || !state.plan) return <Onboarding />;

  return (
    <>
      <main className="app">
        {tab === "home" && <Home go={setTab} />}
        {tab === "training" && <Training />}
        {tab === "activity" && <Activity />}
        {tab === "nutrition" && <Nutrition />}
        {tab === "coach" && <Coach />}
        {tab === "profile" && <ProfileScreen />}
      </main>
      <div className="tabbar">
        <nav>
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)} aria-current={tab === t.id}>
              <span className="ic">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
