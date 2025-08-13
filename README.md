Dream Journal · Spatial
Log your dreams and visualize them on a map.
Frontend is Vite + React + TypeScript with Leaflet; backend is Express (hosted on Render).

Live app: https://dream-journal-spatial.vercel.app/

API (Render): https://dream-journal-spatial.onrender.com

Note: The API currently uses in-memory storage. Data is cleared on server restarts (see Roadmap for persistent DB).

Features
✍️ Create & list dreams (title, date, mood, tags, text)

🗺️ Map tab: click to attach a location to a dream

🔎 Address search (Nominatim) & reverse geocoding

📍 “Use my location” (Geolocation API, requires HTTPS + browser permission)

🔎 Filters: mood + date range

🌩️ Toast notifications & small UX touches

💾 localStorage backup/merge (shows local first, merges with server)

Tech
Frontend: Vite, React 19, TypeScript, React-Leaflet, Leaflet

Backend: Node.js (≥ 18), Express

Map/Geocoder: OpenStreetMap & Nominatim (polite UA + language headers)

Hosting: Vercel (FE), Render (BE)

Local Development
Requirements
Node v20 recommended (≥ 18 required because of global fetch)

npm (or pnpm/yarn)

Setup
bash
Kopyala
Düzenle
git clone <repo-url> dream-journal-spatial
cd dream-journal-spatial
npm install
Environment variables
Create .env at project root:

env
Kopyala
Düzenle
VITE_API_URL=http://localhost:5174
Run (FE + BE together)
bash
Kopyala
Düzenle
# Run both API and Vite dev server
npm run dev:all

# or individually
npm run server      # API: http://localhost:5174
npm run dev         # FE : http://localhost:5173
Build / Preview
bash
Kopyala
Düzenle
npm run build
npm run preview
Scripts (from package.json)
json
Kopyala
Düzenle
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "server": "nodemon server/index.js",
    "dev:all": "concurrently \"npm run server\" \"npm run dev\""
  }
}
API
Base URL (local): http://localhost:5174
Production: https://dream-journal-spatial.onrender.com

CORS
Server returns permissive CORS headers for all requests and responds to preflight:

pgsql
Kopyala
Düzenle
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,POST,OPTIONS
Access-Control-Allow-Headers: <echoed request headers> (or Content-Type)
Don’t send a Content-Type header on GET requests—doing so triggers a preflight.

Endpoints
GET /api/dreams → Dream[]

POST /api/dreams → 201 + created Dream

bash
Kopyala
Düzenle
curl -X POST http://localhost:5174/api/dreams \
  -H "Content-Type: application/json" \
  -d '{"title":"flying","text":"...","date":"2025-08-12","mood":"neutral","tags":["water"],"location":{"lat":41,"lng":29}}'
GET /api/geocode/search?q=istanbul&limit=5 → { lat, lng, label }[]

GET /api/geocode/reverse?lat=41&lng=29 → { lat, lng, label }

The server proxies Nominatim with polite headers:

http
Kopyala
Düzenle
User-Agent: DreamJournalSpatial/1.0 (youremail@example.com)
Accept-Language: tr,en;q=0.9
Deployment
Backend (Render)
Start Command: node server/index.js

Build Command: npm install --omit=dev

Health Check Path: /api/dreams

Environment → Add: NODE_VERSION=20 (or 22)

Manual Deploy → Clear build cache & Deploy

You should see in logs:
“**API running on http://localhost:…**” and GET /api/dreams 200.

Frontend (Vercel)
Settings → Environment Variables
VITE_API_URL = https://dream-journal-spatial.onrender.com

Framework Preset: Vite
Build: vite build — Output: dist

Redeploy and hard refresh (Ctrl/Cmd + F5).

Geolocation Notes
Requires HTTPS and user permission.

If denied, use browser’s address bar → lock icon → Site settings → Location: Allow.

On free tiers, the very first API request may be slow due to cold start—showing a toast/loader helps.

Project Structure
pgsql
Kopyala
Düzenle
dream-journal-spatial/
├─ server/
│  └─ index.js           # Express API (CORS + geocoder proxy, error-hardened)
├─ src/
│  ├─ components/
│  │  ├─ DreamForm.tsx
│  │  ├─ MapTab.tsx
│  │  └─ GeocoderSearch.tsx
│  ├─ lib/
│  │  └─ api.ts          # fetch helpers
│  ├─ types.ts
│  ├─ index.css
│  └─ App.tsx
├─ .env.example
├─ package.json
└─ vite.config.ts
Troubleshooting
CORS error + 502 in browser: Backend is likely down.
Check Render Runtime logs. Common root causes:

fetch is not defined → set NODE_VERSION >= 18 (20/22 recommended).

Start/health misconfig → use node server/index.js and /api/dreams.

GET triggers preflight: Remove Content-Type header on GET calls.

“Use my location” doesn’t work:

Ensure HTTPS + site permission is Allow.

Windows privacy settings → Location enabled.

Cold start may delay the first API call; try again after a few seconds.

Roadmap
🗃️ Persistent DB (Supabase/Railway Postgres): schema + migrations

🧹 CRUD: edit/delete dreams

🗺️ Cluster/heatmap toggle & richer popups

🔐 Optional auth

⚡ Cache for Nominatim (basic in-memory TTL) to reduce rate/latency

Acknowledgements
Map data © OpenStreetMap contributors

Geocoding: Nominatim (respect usage policy)

License
MIT (update if you prefer another)
