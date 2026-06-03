import type { UIMessage } from "ai";
import { useCallback, useEffect, useState } from "react";

export type ThreadRecord = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const STORAGE_KEY = "cohere-ai-threads-v1";

function newId() {
  return `t_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function readAll(): ThreadRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ThreadRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(threads: ThreadRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

export function deriveTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "Новый чат";
  const text = firstUser.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!text) return "Новый чат";
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

export function createThread(): ThreadRecord {
  const t: ThreadRecord = {
    id: newId(),
    title: "Новый чат",
    updatedAt: Date.now(),
    messages: [],
  };
  const all = readAll();
  writeAll([t, ...all]);
  return t;
}

export function getThread(id: string): ThreadRecord | null {
  return readAll().find((t) => t.id === id) ?? null;
}

export function saveThread(id: string, messages: UIMessage[]) {
  const all = readAll();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) {
    const t: ThreadRecord = {
      id,
      title: deriveTitle(messages),
      updatedAt: Date.now(),
      messages,
    };
    writeAll([t, ...all]);
    return;
  }
  all[idx] = {
    ...all[idx],
    title: all[idx].title === "Новый чат" ? deriveTitle(messages) : all[idx].title,
    messages,
    updatedAt: Date.now(),
  };
  writeAll(all);
}

export function deleteThread(id: string) {
  writeAll(readAll().filter((t) => t.id !== id));
}

export function renameThread(id: string, title: string) {
  const all = readAll();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], title };
  writeAll(all);
}

export function clearAllThreads() {
  writeAll([]);
}

/** Subscribe to thread list updates (cross-tab + manual). */
export function useThreads() {
  const [threads, setThreads] = useState<ThreadRecord[]>([]);

  const refresh = useCallback(() => setThreads(readAll()), []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    const onCustom = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cohere-threads-changed", onCustom);
    const i = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cohere-threads-changed", onCustom);
      window.clearInterval(i);
    };
  }, [refresh]);

  return { threads, refresh };
}

export function notifyThreadsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("cohere-threads-changed"));
}