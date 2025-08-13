# Dream Journal · Spatial

Log your dreams and visualize them on a **map**.  
Frontend: Vite + React + TypeScript + **Leaflet** · Backend: **Express** on Render.

- **Live app:** https://dream-journal-spatial.vercel.app/
- **API (Render):** https://dream-journal-spatial.onrender.com

> **Note:** The API currently uses **in-memory storage**. Data resets on server restarts. See **Roadmap** for a persistent DB.

---

## Features

- ✍️ Create & list dreams (title, date, mood, tags, text)
- 🗺️ Map tab: click to attach a location to a dream
- 🔎 Address search (Nominatim) & reverse geocoding
- 📍 “Use my location” (Geolocation API; requires HTTPS + user permission)
- 🧭 Filters: mood + date range
- 🌩️ Toast notifications & small UX touches
- 💾 `localStorage` backup/merge (shows local first, then merges with server)

---

## Tech Stack

- **Frontend:** Vite, React 19, TypeScript, React-Leaflet, Leaflet  
- **Backend:** Node.js (≥ 18), Express  
- **Map/Geocoder:** OpenStreetMap & Nominatim (polite UA + language headers)  
- **Hosting:** Vercel (FE), Render (BE)

---

## Local Development

### Requirements
- Node **v20** recommended (≥ 18 required because of global `fetch`)
- npm (or pnpm/yarn)

### Setup
```bash
git clone <repo-url> dream-journal-spatial
cd dream-journal-spatial
npm install

