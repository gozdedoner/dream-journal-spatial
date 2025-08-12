
# Dream Journal · Spatial (Leaflet + React)

Minimal demo that turns a Dream Journal into a **Spatial UI**:
- Add dream entries with **mood, tags, and map location**.
- Browse dreams on a **map** with date/mood filters.
- Simple Node API with in-memory store.

## Run locally
```bash
npm i
cp .env.example .env
npm run server   # starts API on 5174
npm run dev      # starts Vite on 5173
# or
npm run dev:all  # run both (requires concurrently)
```

## Tech
- React + Vite + TypeScript
- Leaflet + react-leaflet
- Node + Express (in-memory; swap with Supabase/SQLite later)
