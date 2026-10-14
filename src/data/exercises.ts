import type { Exercise } from "../types";

const ex = (e: Exercise) => e;

export const EXERCISES: Exercise[] = [
  // Brust
  ex({ id: "bankdruecken", name: "Bankdrücken", muscle: "brust", secondary: ["trizeps", "schultern"], pattern: "push", equipment: "langhantel", compound: true, level: "anfaenger", cues: ["Schulterblätter zusammen und nach unten", "Stange kontrolliert zur unteren Brust", "Füße fest am Boden"] }),
  ex({ id: "kh-bankdruecken", name: "Kurzhantel-Bankdrücken", muscle: "brust", secondary: ["trizeps", "schultern"], pattern: "push", equipment: "kurzhantel", compound: true, level: "anfaenger", cues: ["Hanteln auf Brusthöhe absenken", "Ellbogen ca. 45° zum Körper", "Oben nicht klacken lassen"] }),
  ex({ id: "schraegbank-kh", name: "Schrägbankdrücken (KH)", muscle: "brust", secondary: ["schultern", "trizeps"], pattern: "push", equipment: "kurzhantel", compound: true, level: "anfaenger", cues: ["Bank auf 30°", "Obere Brust anspannen", "Langsam absenken"] }),
  ex({ id: "liegestuetz", name: "Liegestütz", muscle: "brust", secondary: ["trizeps", "core"], pattern: "push", equipment: "koerpergewicht", compound: true, level: "anfaenger", cues: ["Körper bildet eine Linie", "Brust fast zum Boden", "Bauch und Po fest"] }),
  ex({ id: "dips", name: "Dips", muscle: "brust", secondary: ["trizeps", "schultern"], pattern: "push", equipment: "koerpergewicht", compound: true, level: "fortgeschritten", cues: ["Leicht nach vorne lehnen", "Bis Oberarm parallel", "Schultern weg von den Ohren"] }),
  ex({ id: "kabel-flys", name: "Kabelzug-Flys", muscle: "brust", secondary: [], pattern: "push", equipment: "kabel", compound: false, level: "anfaenger", cues: ["Leicht gebeugte Ellbogen", "Hände vor der Brust zusammenführen", "Dehnung kontrollieren"] }),
  ex({ id: "brustpresse", name: "Brustpresse (Maschine)", muscle: "brust", secondary: ["trizeps"], pattern: "push", equipment: "maschine", compound: true, level: "anfaenger", cues: ["Griffe auf Brusthöhe", "Rücken bleibt am Polster", "Nicht ganz durchstrecken"] }),

  // Rücken
  ex({ id: "klimmzug", name: "Klimmzüge", muscle: "ruecken", secondary: ["bizeps"], pattern: "pull", equipment: "koerpergewicht", compound: true, level: "fortgeschritten", cues: ["Aus dem toten Hang starten", "Brust zur Stange", "Kein Schwung"] }),
  ex({ id: "latzug", name: "Latzug", muscle: "ruecken", secondary: ["bizeps"], pattern: "pull", equipment: "kabel", compound: true, level: "anfaenger", cues: ["Stange zur oberen Brust", "Ellbogen nach unten ziehen", "Oberkörper ruhig"] }),
  ex({ id: "langhantelrudern", name: "Langhantelrudern", muscle: "ruecken", secondary: ["bizeps", "core"], pattern: "pull", equipment: "langhantel", compound: true, level: "fortgeschritten", cues: ["Rücken gerade, ca. 45° vorgebeugt", "Stange zum Bauchnabel", "Schulterblätter zusammen"] }),
  ex({ id: "kh-rudern", name: "Einarmiges KH-Rudern", muscle: "ruecken", secondary: ["bizeps"], pattern: "pull", equipment: "kurzhantel", compound: true, level: "anfaenger", cues: ["Auf Bank abstützen", "Ellbogen nah am Körper", "Hantel zur Hüfte"] }),
  ex({ id: "kabelrudern", name: "Rudern am Kabel (sitzend)", muscle: "ruecken", secondary: ["bizeps"], pattern: "pull", equipment: "kabel", compound: true, level: "anfaenger", cues: ["Brust raus", "Griff zum Bauch", "Kontrolliert zurück"] }),
  ex({ id: "face-pulls", name: "Face Pulls", muscle: "schultern", secondary: ["ruecken"], pattern: "pull", equipment: "kabel", compound: false, level: "anfaenger", cues: ["Seil auf Augenhöhe", "Hände neben die Ohren", "Außenrotation am Ende"] }),
  ex({ id: "band-rudern", name: "Rudern mit Band", muscle: "ruecken", secondary: ["bizeps"], pattern: "pull", equipment: "band", compound: true, level: "anfaenger", cues: ["Band um Fuß oder Pfosten", "Schulterblätter zusammen", "2 Sek halten"] }),
  ex({ id: "inverted-row", name: "Australische Klimmzüge", muscle: "ruecken", secondary: ["bizeps", "core"], pattern: "pull", equipment: "koerpergewicht", compound: true, level: "anfaenger", cues: ["Unter Tisch oder Stange", "Körper gerade", "Brust zur Stange"] }),

  // Schultern
  ex({ id: "schulterdruecken", name: "Schulterdrücken (LH)", muscle: "schultern", secondary: ["trizeps", "core"], pattern: "push", equipment: "langhantel", compound: true, level: "fortgeschritten", cues: ["Po und Bauch fest", "Stange über den Kopf", "Kopf durch die Arme"] }),
  ex({ id: "kh-schulterdruecken", name: "KH-Schulterdrücken", muscle: "schultern", secondary: ["trizeps"], pattern: "push", equipment: "kurzhantel", compound: true, level: "anfaenger", cues: ["Sitzend oder stehend", "Hanteln auf Ohrhöhe starten", "Nicht ins Hohlkreuz"] }),
  ex({ id: "seitheben", name: "Seitheben", muscle: "schultern", secondary: [], pattern: "push", equipment: "kurzhantel", compound: false, level: "anfaenger", cues: ["Leicht gebeugte Arme", "Bis Schulterhöhe", "Langsam absenken"] }),
  ex({ id: "pike-pushup", name: "Pike Push-ups", muscle: "schultern", secondary: ["trizeps"], pattern: "push", equipment: "koerpergewicht", compound: true, level: "fortgeschritten", cues: ["Hüfte hoch, umgekehrtes V", "Kopf Richtung Boden", "Kraftvoll hochdrücken"] }),

  // Arme
  ex({ id: "kh-curls", name: "Kurzhantel-Curls", muscle: "bizeps", secondary: [], pattern: "pull", equipment: "kurzhantel", compound: false, level: "anfaenger", cues: ["Ellbogen am Körper", "Kein Schwung", "Oben kurz anspannen"] }),
  ex({ id: "hammer-curls", name: "Hammer-Curls", muscle: "bizeps", secondary: [], pattern: "pull", equipment: "kurzhantel", compound: false, level: "anfaenger", cues: ["Neutraler Griff", "Kontrolliert absenken"] }),
  ex({ id: "band-curls", name: "Curls mit Band", muscle: "bizeps", secondary: [], pattern: "pull", equipment: "band", compound: false, level: "anfaenger", cues: ["Auf das Band stellen", "Ellbogen fixiert"] }),
  ex({ id: "trizeps-kabel", name: "Trizepsdrücken am Kabel", muscle: "trizeps", secondary: [], pattern: "push", equipment: "kabel", compound: false, level: "anfaenger", cues: ["Ellbogen fest am Körper", "Unten voll strecken"] }),
  ex({ id: "ueberkopf-trizeps", name: "Überkopf-Trizeps (KH)", muscle: "trizeps", secondary: [], pattern: "push", equipment: "kurzhantel", compound: false, level: "anfaenger", cues: ["Ellbogen zeigen nach vorne", "Tief in die Dehnung"] }),
  ex({ id: "diamond-pushup", name: "Diamant-Liegestütz", muscle: "trizeps", secondary: ["brust"], pattern: "push", equipment: "koerpergewicht", compound: true, level: "fortgeschritten", cues: ["Hände bilden ein Dreieck", "Ellbogen nah am Körper"] }),

  // Beine
  ex({ id: "kniebeuge", name: "Kniebeuge (LH)", muscle: "beine", secondary: ["po", "core"], pattern: "legs", equipment: "langhantel", compound: true, level: "fortgeschritten", cues: ["Brust raus, Blick nach vorne", "Knie folgen den Zehen", "Mindestens parallel"] }),
  ex({ id: "goblet-squat", name: "Goblet Squat", muscle: "beine", secondary: ["po", "core"], pattern: "legs", equipment: "kurzhantel", compound: true, level: "anfaenger", cues: ["Hantel vor der Brust", "Ellbogen zwischen die Knie", "Aufrecht bleiben"] }),
  ex({ id: "kreuzheben", name: "Kreuzheben", muscle: "po", secondary: ["ruecken", "beine"], pattern: "legs", equipment: "langhantel", compound: true, level: "fortgeschritten", cues: ["Stange nah am Schienbein", "Rücken neutral", "Hüfte und Schultern gleichzeitig hoch"] }),
  ex({ id: "rumaenisches-kh", name: "Rumänisches Kreuzheben (KH)", muscle: "po", secondary: ["beine", "ruecken"], pattern: "legs", equipment: "kurzhantel", compound: true, level: "anfaenger", cues: ["Hüfte nach hinten schieben", "Leicht gebeugte Knie", "Dehnung in den Oberschenkelrückseiten"] }),
  ex({ id: "beinpresse", name: "Beinpresse", muscle: "beine", secondary: ["po"], pattern: "legs", equipment: "maschine", compound: true, level: "anfaenger", cues: ["Füße schulterbreit", "Knie nicht durchstrecken", "Unterer Rücken bleibt am Polster"] }),
  ex({ id: "ausfallschritte", name: "Ausfallschritte", muscle: "beine", secondary: ["po"], pattern: "legs", equipment: "kurzhantel", compound: true, level: "anfaenger", cues: ["Großer Schritt", "Hinteres Knie fast zum Boden", "Oberkörper aufrecht"] }),
  ex({ id: "bulgarian", name: "Bulgarische Split Squats", muscle: "beine", secondary: ["po"], pattern: "legs", equipment: "kurzhantel", compound: true, level: "fortgeschritten", cues: ["Hinterer Fuß auf der Bank", "Vorderes Knie stabil", "Tief runter"] }),
  ex({ id: "hip-thrust", name: "Hip Thrust", muscle: "po", secondary: ["beine"], pattern: "legs", equipment: "langhantel", compound: true, level: "anfaenger", cues: ["Schulterblätter auf der Bank", "Oben Po maximal anspannen", "Kinn zur Brust"] }),
  ex({ id: "glute-bridge", name: "Glute Bridge", muscle: "po", secondary: ["beine"], pattern: "legs", equipment: "koerpergewicht", compound: true, level: "anfaenger", cues: ["Fersen nah am Po", "Hüfte hoch", "2 Sek halten"] }),
  ex({ id: "bodyweight-squat", name: "Kniebeuge (Körpergewicht)", muscle: "beine", secondary: ["po"], pattern: "legs", equipment: "koerpergewicht", compound: true, level: "anfaenger", cues: ["Arme nach vorne", "Gewicht auf den Fersen", "Tief und kontrolliert"] }),
  ex({ id: "beinbeuger", name: "Beinbeuger (Maschine)", muscle: "beine", secondary: [], pattern: "legs", equipment: "maschine", compound: false, level: "anfaenger", cues: ["Hüfte bleibt unten", "Langsam zurück"] }),
  ex({ id: "beinstrecker", name: "Beinstrecker (Maschine)", muscle: "beine", secondary: [], pattern: "legs", equipment: "maschine", compound: false, level: "anfaenger", cues: ["Oben 1 Sek halten", "Kontrolliert absenken"] }),
  ex({ id: "kb-swing", name: "Kettlebell Swing", muscle: "po", secondary: ["beine", "core"], pattern: "legs", equipment: "kettlebell", compound: true, level: "anfaenger", cues: ["Hüftbewegung, keine Kniebeuge", "Explosiv nach vorne", "Arme sind nur Seile"] }),
  ex({ id: "wadenheben", name: "Wadenheben", muscle: "waden", secondary: [], pattern: "legs", equipment: "koerpergewicht", compound: false, level: "anfaenger", cues: ["Auf einer Stufe", "Volle Dehnung unten", "Oben halten"] }),

  // Core
  ex({ id: "plank", name: "Unterarmstütz (Plank)", muscle: "core", secondary: [], pattern: "core", equipment: "koerpergewicht", compound: false, level: "anfaenger", cues: ["Ellbogen unter den Schultern", "Po nicht hochstrecken", "Wiederholungen = Sekunden"] }),
  ex({ id: "dead-bug", name: "Dead Bug", muscle: "core", secondary: [], pattern: "core", equipment: "koerpergewicht", compound: false, level: "anfaenger", cues: ["Unterer Rücken am Boden", "Gegengleich Arm und Bein strecken"] }),
  ex({ id: "haengendes-beinheben", name: "Hängendes Beinheben", muscle: "core", secondary: [], pattern: "core", equipment: "koerpergewicht", compound: false, level: "fortgeschritten", cues: ["Kein Schwung", "Becken einrollen"] }),
  ex({ id: "pallof", name: "Pallof Press", muscle: "core", secondary: [], pattern: "core", equipment: "kabel", compound: false, level: "anfaenger", cues: ["Seitlich zum Kabel", "Arme gerade nach vorne", "Rotation widerstehen"] }),
  ex({ id: "russian-twist", name: "Russian Twist", muscle: "core", secondary: [], pattern: "core", equipment: "kurzhantel", compound: false, level: "anfaenger", cues: ["Oberkörper leicht zurück", "Von Seite zu Seite drehen"] }),
];

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export const MUSCLE_LABEL: Record<string, string> = {
  brust: "Brust",
  ruecken: "Rücken",
  schultern: "Schultern",
  bizeps: "Bizeps",
  trizeps: "Trizeps",
  beine: "Beine",
  po: "Po",
  waden: "Waden",
  core: "Core",
};

export const EQUIPMENT_LABEL: Record<string, string> = {
  koerpergewicht: "Körpergewicht",
  kurzhantel: "Kurzhanteln",
  langhantel: "Langhantel",
  maschine: "Maschinen",
  kabel: "Kabelzug",
  kettlebell: "Kettlebell",
  band: "Widerstandsband",
};
