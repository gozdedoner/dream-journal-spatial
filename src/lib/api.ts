// src/lib/api.ts
import type { DreamEntry } from "../types";

// Vercel'de VITE_API_URL (https://<render-app>.onrender.com) gelecek.
// Sondaki / işaretini temizliyoruz; yoksa //api/... olur.
const BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:5174";

type GeocodeItem = { lat: number; lng: number; label: string };
type ReverseGeocode = { lat: number; lng: number; label: string };

// Küçük yardımcı: hata kontrolü + ilk isteğe minik retry (Render soğuk başlatma için)
async function apiFetch<T>(path: string, init?: RequestInit, retries = 1): Promise<T> {
  try {
    const r = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      throw new Error(`API ${r.status} ${r.statusText} ${text ? `- ${text}` : ""}`);
    }
    return r.json() as Promise<T>;
  } catch (err) {
    if (retries > 0) {
      // 700ms bekle ve bir kez daha dene (Render cold-start)
      await new Promise((res) => setTimeout(res, 700));
      return apiFetch<T>(path, init, retries - 1);
    }
    throw err;
  }
}

export async function listDreams(): Promise<DreamEntry[]> {
  return apiFetch<DreamEntry[]>("/api/dreams");
}

export async function createDream(payload: Omit<DreamEntry, "id">): Promise<DreamEntry> {
  return apiFetch<DreamEntry>("/api/dreams", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function geocodeSearch(q: string, limit = 5): Promise<GeocodeItem[]> {
  const qs = new URLSearchParams({ q, limit: String(limit) }).toString();
  return apiFetch<GeocodeItem[]>(`/api/geocode/search?${qs}`);
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocode> {
  const qs = new URLSearchParams({ lat: String(lat), lng: String(lng) }).toString();
  return apiFetch<ReverseGeocode>(`/api/geocode/reverse?${qs}`);
}

// İstersen dışarıya BASE'i de açabilirsin (debug için)
// export { BASE };
