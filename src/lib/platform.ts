// Laufzeit-Erkennung: eigenständige PWA/Server vs. eingebettet als claude.ai-Artifact.
// Im Artifact gibt es keinen eigenen Server; dort laufen Coach (sample) und
// Datensicherung (db) über die Artifact-Capabilities.

type Use = (name: string) => Promise<unknown>;

function claudeUse(): Use | null {
  const c = (globalThis as { claude?: { use?: Use } }).claude;
  return typeof c?.use === "function" ? c.use.bind(c) : null;
}

export const isArtifact = claudeUse() !== null;

export async function capability<T>(name: string): Promise<T | null> {
  const use = claudeUse();
  if (!use) return null;
  try {
    return ((await use(name)) as T | null) ?? null;
  } catch {
    return null;
  }
}

// Minimale Typen für die genutzten Capability-Funktionen
export interface SampleFn {
  (
    input: string | { role: "user" | "assistant"; content: string }[],
    opts?: { onText?: (p: { text: string; delta: string }) => void; signal?: AbortSignal; cache?: boolean },
  ): Promise<{ text: string; truncated: boolean }>;
}
export interface DocRef {
  get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>;
  set(data: Record<string, unknown>): Promise<void>;
}
export interface Db {
  doc(path: string): DocRef;
}
export interface UserCap {
  id(): Promise<string | null>;
}
