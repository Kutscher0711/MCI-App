import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
app.use(express.json({ limit: "1mb" }));

const MODEL = "claude-opus-5-5";
let client: Anthropic | null = null;
try {
  client = new Anthropic();
} catch {
  client = null; // ohne Zugangsdaten läuft die App, nur der Coach ist aus
}

const SYSTEM_PROMPT = `Du bist "Coach", der persönliche KI-Trainer in einer Fitness-App.
Du hilfst bei Krafttraining, Cardio, Ernährung, Mobility und Regeneration.

So arbeitest du:
- Antworte auf Deutsch, per du, motivierend aber ehrlich und konkret.
- Nutze die Nutzerdaten im Kontextblock (Profil, Plan, letzte Workouts, Ernährung) und beziehe dich direkt darauf, z. B. auf Gewichte, Wiederholungen oder Kalorienziele.
- Halte Antworten kurz und gut lesbar (Markdown-Listen, max. ~200 Wörter), außer der Nutzer will ausdrücklich mehr Details.
- Gib praktische Empfehlungen mit Zahlen (Sätze, Wdh., Gewicht, Gramm, Minuten), wenn sinnvoll.
- Du bist kein Arzt: Bei Schmerzen, Verletzungen, Vorerkrankungen, Essstörungen oder Medikamenten empfiehlst du, ärztlichen oder physiotherapeutischen Rat einzuholen, und schlägst nur schonende Alternativen vor.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, coach: client !== null });
});

app.post("/api/coach", async (req, res) => {
  const { messages, context } = req.body as { messages?: ChatMessage[]; context?: unknown };
  if (!Array.isArray(messages) || messages.length === 0 || messages.at(-1)?.role !== "user") {
    res.status(400).json({ error: "messages muss mit einer Nutzer-Nachricht enden" });
    return;
  }
  if (!client) {
    res.status(503).json({ error: "KI-Coach ist nicht konfiguriert (ANTHROPIC_API_KEY fehlt)." });
    return;
  }

  const history: Anthropic.Beta.BetaMessageParam[] = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-30)
    .map((m) => ({ role: m.role, content: m.content }));

  // Kontext als eigener Block vor der letzten Frage, damit der stabile System-Prompt cachebar bleibt.
  const last = history.pop()!;
  history.push({
    role: "user",
    content: [
      { type: "text", text: `<nutzerdaten>\n${JSON.stringify(context ?? {}, null, 1)}\n</nutzerdaten>` },
      { type: "text", text: typeof last.content === "string" ? last.content : "" },
    ],
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const send = (event: string, data: unknown) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: history,
  });
  res.on("close", () => stream.abort());

  try {
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        send("delta", { text: event.delta.text });
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      send("error", { error: "Dazu kann ich leider nichts sagen. Formuliere die Frage gern anders." });
    }
    send("done", {});
  } catch (err) {
    if (err instanceof Anthropic.APIUserAbortError) return;
    let message = "Der Coach ist gerade nicht erreichbar.";
    if (err instanceof Anthropic.AuthenticationError) message = "API-Schlüssel ungültig.";
    else if (err instanceof Anthropic.RateLimitError) message = "Zu viele Anfragen – bitte kurz warten.";
    else if (err instanceof Anthropic.APIConnectionError) message = "Keine Verbindung zur KI – bitte später erneut versuchen.";
    else if (err instanceof Anthropic.APIError) message = `API-Fehler (${err.status ?? "?"}).`;
    else if (err instanceof Anthropic.AnthropicError) message = "KI-Coach ist nicht konfiguriert – ANTHROPIC_API_KEY in .env setzen.";
    console.error("[coach]", err);
    send("error", { error: message });
  } finally {
    res.end();
  }
});

// Im Produktionsmodus das gebaute Frontend ausliefern
if (process.env.NODE_ENV === "production") {
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
  app.use(express.static(dist));
  app.get("/{*splat}", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`API läuft auf http://localhost:${port} (Coach ${client ? "aktiv" : "inaktiv"})`));
