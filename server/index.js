import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

/** @typedef {{ id: string, title: string, text: string, date: string, mood: string, tags: string[], location?: {lat:number, lng:number, address?:string} }} Dream */
/** @type {Dream[]} */
const store = [];

// ---- Geocoder headers (EKSİKTİ) ----
const NOM_HEADERS = {
  "User-Agent": "DreamJournalSpatial/1.0 (contact@example.com)",
  "Accept-Language": "tr,en;q=0.9",
};

// ---- Routes ----
app.get("/", (_req, res) => res.send("Dream API is running. Try GET /api/dreams"));
app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.get("/api/dreams", (_req, res) => res.json(store));

app.post("/api/dreams", (req, res) => {
  const body = req.body || {};
  const dream = { id: randomUUID(), ...body };
  store.unshift(dream);
  res.status(201).json(dream);
});

// /api/geocode/search?q=istanbul&limit=5
app.get("/api/geocode/search", async (req, res) => {
  try {
    const q = (req.query.q || "").toString();
    const limit = Number(req.query.limit || 5);
    if (!q) return res.json([]);

    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&q=${encodeURIComponent(q)}&limit=${limit}`;
    const r = await fetch(url, { headers: NOM_HEADERS });
    if (!r.ok) throw new Error(`Upstream ${r.status}`);

    const data = await r.json();
    const results = data.map((d) => ({
      lat: Number(d.lat),
      lng: Number(d.lon),
      label: d.display_name,
    }));
    res.json(results);
  } catch (err) {
    console.error("geocode/search error:", err);
    res.status(502).json({ error: "geocode_failed" });
  }
});

// /api/geocode/reverse?lat=41&lng=29
app.get("/api/geocode/reverse", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng))
      return res.status(400).json({ error: "lat/lng required" });

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const r = await fetch(url, { headers: NOM_HEADERS });
    if (!r.ok) throw new Error(`Upstream ${r.status}`);

    const data = await r.json();
    res.json({ lat, lng, label: data.display_name || "" });
  } catch (err) {
    console.error("geocode/reverse error:", err);
    res.status(502).json({ error: "reverse_failed" });
  }
});

// ---- List ----
const PORT = process.env.PORT || 5174;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
