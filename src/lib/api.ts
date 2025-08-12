// src/lib/api.ts
import type { DreamEntry } from "../types";

const BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:5174";

// Yardımcı: sadece body varsa Content-Type ekle
async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const hasBody = !!(init as any).body;
  const headers = hasBody
    ? { "Content-Type": "application/json", ...(init.headers || {}) }
    : init.headers;

  const r = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json() as Promise<T>;
}

export function listDreams(): Promise<DreamEntry[]> {
  return apiFetch<DreamEntry[]>("/api/dreams"); // GET: header yok → preflight yok
}

export function createDream(payload: Omit<DreamEntry, "id">) {
  return apiFetch<DreamEntry>("/api/dreams", {
    method: "POST",
    body: JSON.stringify(payload), // POST: header var → preflight OK (server OPTIONS hazır)
  });
}

export function geocodeSearch(q: string, limit = 5) {
  const qs = new URLSearchParams({ q, limit: String(limit) }).toString();
  return apiFetch<Array<{ lat: number; lng: number; label: string }>>(
    `/api/geocode/search?${qs}`
  );
}

export function reverseGeocode(lat: number, lng: number) {
  const qs = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  }).toString();
  return apiFetch<{ lat: number; lng: number; label: string }>(
    `/api/geocode/reverse?${qs}`
  );
}
