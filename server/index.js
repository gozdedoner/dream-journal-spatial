import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();

// CORS (preflight dahil) – basit tut
app.use(cors()); // Access-Control-Allow-Origin: * (veya Origin'i yansıtır)
app.options("*", cors()); // OPTIONS preflight'ı yanıtla

app.use(express.json());

/** @typedef {{ id:string, title:string, text:string, date:string, mood:string, tags:string[], location?:{lat:number, lng:number, address?:string} }} Dream */
/** @type {Dream[]} */
const store = [];

app.get("/", (_req, res) =>
  res.send("Dream API is running. Try GET /api/dreams")
);
app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.get("/api/dreams", (_req, res) => res.json(store));
app.post("/api/dreams", (req, res) => {
  const dream = { id: randomUUID(), ...(req.body || {}) };
  store.unshift(dream);
  res.status(201).json(dream);
});

// Nominatim proxy
const NOM_HEADERS = {
  "User-Agent": "DreamJournalSpatial/1.0 (youremail@example.com)",
  "Accept-Language": "tr,en;q=0.9",
};

app.get("/api/geocode/search", async (req, res) => {
  const q = String(req.query.q ?? "");
  const limit = Number(req.query.limit ?? 5);
  if (!q) return res.json([]);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&q=${encodeURIComponent(
    q
  )}&limit=${limit}`;
  const r = await fetch(url, { headers: NOM_HEADERS });
  const data = await r.json();
  res.json(
    data.map((d) => ({
      lat: Number(d.lat),
      lng: Number(d.lon),
      label: d.display_name,
    }))
  );
});

app.get("/api/geocode/reverse", async (req, res) => {
  const lat = Number(req.query.lat),
    lng = Number(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng))
    return res.status(400).json({ error: "lat/lng required" });
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const r = await fetch(url, { headers: NOM_HEADERS });
  const data = await r.json();
  res.json({ lat, lng, label: data.display_name || "" });
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
