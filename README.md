# MCI-App – Personal Training AI

**Live-App (PWA):** https://kutscher0711.github.io/MCI-App/

Unsere eigene Version einer KI-Personal-Training-App, inspiriert von der Feature-Palette der „MCI – Personal Training AI“-App:
**Krafttraining, Cardio, Ernährung, Mobility, Gamification und ein KI-Coach.**

Gebaut mit **React + Vite + TypeScript** (Frontend) und einem kleinen **Express**-Server für den KI-Coach (Claude API).

## Features

| Bereich | Was die App kann |
| --- | --- |
| **Onboarding** | Ziel (Muskelaufbau, Fettabbau, Kraft, Fitness), Level, Trainingstage, Dauer, Equipment (Studio / Zuhause / Körpergewicht) |
| **Trainingsplan** | Automatischer Split (Ganzkörper, OK/UK, PPL) passend zu Tagen, Dauer, Equipment und Level · Startgewichte geschätzt · Übungen tauschen |
| **Workout-Modus** | Sätze/Wdh./Gewicht loggen, Pausentimer, Technik-Hinweise, RPE-Abfrage |
| **Auto-Progression** | Doppelte Progression: Wdh. bis zum oberen Ende, dann Gewicht hoch · bei deutlichem Verfehlen automatisch leichter |
| **Übungsbibliothek** | 40+ Übungen mit Muskelgruppen, Equipment und Coaching-Cues |
| **Cardio** | 20 Sportarten, kcal-Schätzung über MET-Werte, Wochenziel 150 min |
| **Mobility** | 6 geführte Routinen mit Timer (Hüfte, Schulter, Rücken …) |
| **Ernährung** | Kalorien- & Makroziele (Mifflin-St Jeor), Mahlzeiten-Tagebuch, Lebensmittel-DB, Barcode-Lookup über Open Food Facts, eigene Lebensmittel |
| **Gamification** | XP, Level, Ränge, Wochen-Streak, Abzeichen |
| **KI-Coach** | Chat mit Claude, der Profil, Plan, letzte Workouts und Ernährung kennt (Streaming) |

Alle Nutzerdaten werden lokal im Browser (`localStorage`) gespeichert. Nur beim Coach-Chat geht ein Datenauszug an den Server bzw. die Claude API.

## Loslegen

```bash
npm install
cp .env.example .env   # ANTHROPIC_API_KEY eintragen (nur für den KI-Coach nötig)
npm run dev            # Frontend http://localhost:5173 + API :8787
```

Ohne API-Key läuft die komplette App – nur der Coach zeigt einen Hinweis.

### Weitere Befehle

```bash
npm test          # Unit-Tests (Plan-Generator, Progression, Ernährung, Gamification)
npm run build     # Typecheck + Produktions-Build nach dist/
npm start         # Server liefert dist/ und /api aus (Port 8787)
```

## Als App aufs Handy (PWA)

Die App ist eine installierbare Progressive Web App (Manifest, Icons, Service Worker, offline nutzbar).

**Hosting über GitHub Pages:** Der Workflow `.github/workflows/deploy-pages.yml` baut und veröffentlicht die App bei jedem Push auf `main`.
Einmalig nötig: im Repo unter **Settings → Pages → Build and deployment → Source** „GitHub Actions“ wählen.
Danach läuft die App unter https://kutscher0711.github.io/MCI-App/.

**Installieren:**
- **iPhone (Safari):** Teilen-Button → „Zum Home-Bildschirm“
- **Android (Chrome):** Menü ⋮ → „App installieren“

Auf der statischen Seite ist der KI-Coach aus (er braucht den Server mit API-Key). Mit `npm start` auf einem eigenen Server läuft alles inkl. Coach.

**Ohne eigenes Hosting:** `npm run build:artifact` erzeugt eine einzelne HTML-Datei, die als claude.ai-Artifact läuft – dort funktioniert auch der Coach (über dein Claude-Konto) und deine Daten werden privat gesichert.

## Projektstruktur

```
server/index.ts          Express-API: /api/coach (SSE-Streaming mit Claude), /api/health
src/
  data/                  Übungen, Cardio-Aktivitäten, Mobility-Routinen, Lebensmittel
  lib/plan.ts            Plan-Generator, Progression, Übungstausch
  lib/nutrition.ts       Grundumsatz, Kalorien-/Makroziele, Cardio-kcal
  lib/progress.ts        XP, Level, Streaks, Abzeichen
  store.tsx              App-State (useReducer + localStorage)
  screens/               Onboarding, Heute, Training, Cardio/Mobility, Ernährung, Coach, Profil
```

## Ideen für später

- Accounts & Sync (z. B. Supabase) statt nur `localStorage`
- Kamera-Barcode-Scanner (BarcodeDetector API)
- 3D-/Video-Animationen für Übungen
- KI-generierte Planvorschläge und Wochen-Reviews
- PWA / native App (Capacitor oder React Native)
