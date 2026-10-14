import type { Food } from "../types";

// MET-Werte nach dem Compendium of Physical Activities (gerundet)
export const CARDIO_ACTIVITIES = [
  { id: "laufen", name: "Laufen", met: 9.8, icon: "🏃" },
  { id: "joggen", name: "Lockeres Joggen", met: 7.0, icon: "🏃" },
  { id: "gehen", name: "Zügiges Gehen", met: 4.3, icon: "🚶" },
  { id: "wandern", name: "Wandern", met: 6.0, icon: "🥾" },
  { id: "radfahren", name: "Radfahren", met: 7.5, icon: "🚴" },
  { id: "ergometer", name: "Ergometer", met: 6.8, icon: "🚴" },
  { id: "schwimmen", name: "Schwimmen", met: 7.0, icon: "🏊" },
  { id: "rudern", name: "Rudergerät", met: 7.0, icon: "🚣" },
  { id: "crosstrainer", name: "Crosstrainer", met: 5.0, icon: "⚙️" },
  { id: "seilspringen", name: "Seilspringen", met: 11.0, icon: "🪢" },
  { id: "hiit", name: "HIIT", met: 8.0, icon: "🔥" },
  { id: "fussball", name: "Fußball", met: 7.0, icon: "⚽" },
  { id: "basketball", name: "Basketball", met: 6.5, icon: "🏀" },
  { id: "tennis", name: "Tennis", met: 7.3, icon: "🎾" },
  { id: "padel", name: "Padel", met: 6.0, icon: "🎾" },
  { id: "boxen", name: "Boxen (Sandsack)", met: 7.8, icon: "🥊" },
  { id: "klettern", name: "Bouldern / Klettern", met: 7.5, icon: "🧗" },
  { id: "yoga", name: "Yoga", met: 2.5, icon: "🧘" },
  { id: "tanzen", name: "Tanzen", met: 5.0, icon: "💃" },
  { id: "skifahren", name: "Skifahren", met: 6.0, icon: "⛷️" },
] as const;

export const ACTIVITY_BY_ID = Object.fromEntries(CARDIO_ACTIVITIES.map((a) => [a.id, a]));

export interface MobilityRoutine {
  id: string;
  name: string;
  area: string;
  minutes: number;
  steps: { name: string; seconds: number; hint: string }[];
}

export const MOBILITY_ROUTINES: MobilityRoutine[] = [
  {
    id: "morgen",
    name: "Morning Flow",
    area: "Ganzkörper",
    minutes: 6,
    steps: [
      { name: "Katze-Kuh", seconds: 60, hint: "Wirbelsäule rund und hohl im Atemrhythmus" },
      { name: "Weltbeste Dehnung", seconds: 90, hint: "Ausfallschritt, Ellbogen zum Boden, dann aufdrehen – je Seite" },
      { name: "Herabschauender Hund", seconds: 60, hint: "Fersen Richtung Boden, Rücken lang" },
      { name: "Tiefe Hocke", seconds: 60, hint: "Fersen am Boden, Ellbogen drücken Knie auseinander" },
      { name: "Brustwirbel-Rotation", seconds: 90, hint: "Seitlage, oberen Arm nach hinten öffnen – je Seite" },
    ],
  },
  {
    id: "huefte",
    name: "Hüfte öffnen",
    area: "Hüfte",
    minutes: 8,
    steps: [
      { name: "90/90 Sitz", seconds: 120, hint: "Beide Knie 90°, langsam von Seite zu Seite wechseln" },
      { name: "Hüftbeuger-Dehnung", seconds: 120, hint: "Halber Kniestand, Po anspannen – je Seite 60 s" },
      { name: "Taube", seconds: 120, hint: "Vorderes Schienbein quer, Oberkörper absenken – je Seite" },
      { name: "Frosch", seconds: 60, hint: "Knie weit auseinander, Hüfte sanft nach hinten" },
      { name: "Glute Bridge halten", seconds: 60, hint: "Hüfte oben, Po aktiv" },
    ],
  },
  {
    id: "schulter",
    name: "Schulter & Nacken",
    area: "Schultern",
    minutes: 6,
    steps: [
      { name: "Armkreisen", seconds: 60, hint: "Groß und langsam, vorwärts und rückwärts" },
      { name: "Band Pull-Aparts", seconds: 60, hint: "Band auf Brusthöhe auseinanderziehen" },
      { name: "Wandengel", seconds: 90, hint: "Rücken an die Wand, Arme hoch und runter gleiten" },
      { name: "Nackendehnung", seconds: 60, hint: "Ohr zur Schulter – je Seite 30 s" },
      { name: "Türrahmen-Brustdehnung", seconds: 90, hint: "Unterarm am Rahmen, Körper sanft nach vorne" },
    ],
  },
  {
    id: "ruecken",
    name: "Rücken entlasten",
    area: "Rücken",
    minutes: 7,
    steps: [
      { name: "Kindhaltung", seconds: 90, hint: "Arme lang nach vorne, tief atmen" },
      { name: "Katze-Kuh", seconds: 60, hint: "Langsam Wirbel für Wirbel" },
      { name: "Liegende Drehung", seconds: 120, hint: "Knie zur Seite fallen lassen – je Seite 60 s" },
      { name: "Knie zur Brust", seconds: 60, hint: "Rückenlage, sanft schaukeln" },
      { name: "Kobra", seconds: 60, hint: "Hüfte am Boden, Brust sanft heben" },
    ],
  },
  {
    id: "beine",
    name: "Beine & Waden",
    area: "Beine",
    minutes: 7,
    steps: [
      { name: "Oberschenkel-Rückseite", seconds: 120, hint: "Bein gestreckt auf Erhöhung – je Seite 60 s" },
      { name: "Quadrizeps-Dehnung", seconds: 120, hint: "Ferse zum Po, Knie zeigt nach unten – je Seite" },
      { name: "Waden an der Wand", seconds: 90, hint: "Hinteres Bein gestreckt, Ferse am Boden" },
      { name: "Adduktoren-Dehnung", seconds: 90, hint: "Breiter Stand, seitlich verlagern" },
    ],
  },
  {
    id: "abend",
    name: "Abend Cool-down",
    area: "Ganzkörper",
    minutes: 8,
    steps: [
      { name: "Box-Atmung", seconds: 60, hint: "4 s ein, 4 s halten, 4 s aus, 4 s halten" },
      { name: "Liegende Drehung", seconds: 120, hint: "Je Seite 60 s" },
      { name: "Happy Baby", seconds: 60, hint: "Füße greifen, Knie Richtung Achseln" },
      { name: "Beine an die Wand", seconds: 180, hint: "Po nah an die Wand, entspannen" },
      { name: "Totenstellung", seconds: 60, hint: "Komplett loslassen" },
    ],
  },
];

export const MOBILITY_BY_ID = Object.fromEntries(MOBILITY_ROUTINES.map((r) => [r.id, r]));

// Nährwerte pro 100 g (gerundete Durchschnittswerte)
export const FOODS: Food[] = [
  { id: "haferflocken", name: "Haferflocken", kcal: 372, protein: 13.5, carbs: 58.7, fat: 7 },
  { id: "vollmilch", name: "Vollmilch 3,5 %", kcal: 64, protein: 3.3, carbs: 4.8, fat: 3.5 },
  { id: "magerquark", name: "Magerquark", kcal: 67, protein: 12, carbs: 4, fat: 0.3 },
  { id: "skyr", name: "Skyr natur", kcal: 63, protein: 11, carbs: 4, fat: 0.2 },
  { id: "griech-joghurt", name: "Griechischer Joghurt 10 %", kcal: 133, protein: 5, carbs: 4, fat: 10 },
  { id: "ei", name: "Ei (Hühnerei)", kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
  { id: "huehnerbrust", name: "Hähnchenbrust", kcal: 110, protein: 23, carbs: 0, fat: 1.5 },
  { id: "putenbrust", name: "Putenbrust", kcal: 105, protein: 24, carbs: 0, fat: 1 },
  { id: "rinderhack", name: "Rinderhack 5 %", kcal: 125, protein: 21, carbs: 0, fat: 5 },
  { id: "lachs", name: "Lachs", kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { id: "thunfisch", name: "Thunfisch (Dose, Wasser)", kcal: 116, protein: 26, carbs: 0, fat: 1 },
  { id: "tofu", name: "Tofu natur", kcal: 144, protein: 15, carbs: 2, fat: 8.7 },
  { id: "linsen", name: "Linsen (gekocht)", kcal: 116, protein: 9, carbs: 20, fat: 0.4 },
  { id: "kichererbsen", name: "Kichererbsen (gekocht)", kcal: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  { id: "reis", name: "Reis (gekocht)", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: "nudeln", name: "Nudeln (gekocht)", kcal: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  { id: "kartoffeln", name: "Kartoffeln (gekocht)", kcal: 86, protein: 1.9, carbs: 20, fat: 0.1 },
  { id: "suesskartoffel", name: "Süßkartoffel", kcal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { id: "vollkornbrot", name: "Vollkornbrot", kcal: 247, protein: 8.5, carbs: 41, fat: 3.4 },
  { id: "broetchen", name: "Brötchen", kcal: 270, protein: 9, carbs: 54, fat: 1.5 },
  { id: "banane", name: "Banane", kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { id: "apfel", name: "Apfel", kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { id: "beeren", name: "Beeren (gemischt)", kcal: 50, protein: 1, carbs: 12, fat: 0.3 },
  { id: "brokkoli", name: "Brokkoli", kcal: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { id: "spinat", name: "Spinat", kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { id: "tomate", name: "Tomate", kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { id: "avocado", name: "Avocado", kcal: 160, protein: 2, carbs: 9, fat: 15 },
  { id: "mandeln", name: "Mandeln", kcal: 579, protein: 21, carbs: 22, fat: 50 },
  { id: "erdnussbutter", name: "Erdnussbutter", kcal: 588, protein: 25, carbs: 20, fat: 50 },
  { id: "olivenoel", name: "Olivenöl", kcal: 884, protein: 0, carbs: 0, fat: 100 },
  { id: "kaese", name: "Gouda", kcal: 356, protein: 25, carbs: 2.2, fat: 27 },
  { id: "mozzarella", name: "Mozzarella light", kcal: 165, protein: 19, carbs: 1, fat: 9 },
  { id: "hüttenkäse", name: "Hüttenkäse", kcal: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { id: "whey", name: "Whey Protein", kcal: 380, protein: 78, carbs: 6, fat: 5 },
  { id: "proteinriegel", name: "Proteinriegel", kcal: 350, protein: 33, carbs: 30, fat: 12 },
  { id: "dunkle-schoko", name: "Zartbitterschokolade 70 %", kcal: 598, protein: 7.8, carbs: 46, fat: 43 },
  { id: "pizza", name: "Pizza Margherita", kcal: 266, protein: 11, carbs: 33, fat: 10 },
  { id: "doener", name: "Döner Kebab", kcal: 215, protein: 12, carbs: 20, fat: 10 },
  { id: "cola", name: "Cola", kcal: 42, protein: 0, carbs: 10.6, fat: 0 },
  { id: "bier", name: "Bier", kcal: 43, protein: 0.5, carbs: 3.6, fat: 0 },
];
