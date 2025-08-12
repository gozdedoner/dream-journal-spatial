
import type { DreamEntry } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5174";

export async function listDreams(): Promise<DreamEntry[]> {
  const r = await fetch(`${BASE}/api/dreams`);
  return r.json();
}

export async function createDream(payload: Omit<DreamEntry, 'id'>): Promise<DreamEntry> {
  const r = await fetch(`${BASE}/api/dreams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return r.json();
}

export async function geocodeSearch(q: string, limit=5) {
  const r = await fetch(`${BASE}/api/geocode/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  return r.json() as Promise<Array<{lat:number; lng:number; label:string}>>;
}
export async function reverseGeocode(lat:number, lng:number) {
  const r = await fetch(`${BASE}/api/geocode/reverse?lat=${lat}&lng=${lng}`);
  return r.json() as Promise<{lat:number; lng:number; label:string}>;
}
