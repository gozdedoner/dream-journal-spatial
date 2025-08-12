import { useEffect, useMemo, useState } from "react";
import MapTab from "./components/MapTab";
import DreamForm from "./components/DreamForm";
import GeocoderSearch from "./components/GeocoderSearch";
import type { DreamEntry, Mood } from "./types";
import { listDreams, createDream, reverseGeocode } from "./lib/api";

type Tab = "list" | "map";

export default function App() {
  // Tabs & data
  const [tab, setTab] = useState<Tab>("list");
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [pickMode, setPickMode] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>();

  // Filters
  const [qMood, setQMood] = useState<Mood | "all">("all");
  const [qStart, setQStart] = useState("");
  const [qEnd, setQEnd] = useState("");

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  // ---------- localStorage kalıcılık ----------
  const LS_KEY = "dj_entries_v1";

  function loadLocal(): DreamEntry[] {
    try {
      const s = localStorage.getItem(LS_KEY);
      if (!s) return [];
      const arr = JSON.parse(s);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  function saveLocal(list: DreamEntry[]) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch {}
  }
  function mergeById(server: DreamEntry[], local: DreamEntry[]) {
    // Sunucu öncelikli olacak şekilde birleştir
    const m = new Map<string, DreamEntry>();
    [...local, ...server].forEach((x) => m.set(x.id, x));
    return Array.from(m.values());
  }

  // İlk yükleme: önce localStorage göster, sonra server ile birleştir
  useEffect(() => {
    const local = loadLocal();
    if (local.length) setEntries(local);
    listDreams()
      .then((server) => {
        const merged = mergeById(server, local);
        setEntries(merged);
        saveLocal(merged);
      })
      .catch(console.error);
  }, []);

  // ---------- Use my location ----------
  const [locBusy, setLocBusy] = useState(false);
  async function useMyLocation() {
    if (!("geolocation" in navigator)) {
      showToast("Geolocation desteklenmiyor");
      return;
    }
    try {
      setLocBusy(true);
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 0,
        })
      );
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Haritayı konuma uçur
      setMapCenter([lat, lng]);

      // Adresi reverse geocode ile al ve formu doldur
      let label = "";
      try {
        const r = await reverseGeocode(lat, lng);
        label = r.label;
      } catch {}
      window.dispatchEvent(
        new CustomEvent("pick-location", { detail: { lat, lng, address: label } })
      );
      showToast("Konum alındı");
    } catch {
      showToast("Konum alınamadı");
    } finally {
      setLocBusy(false);
    }
  }

  // Filtreli liste
  const filtered = useMemo(() => {
    return entries.filter((d) => {
      if (qMood !== "all" && d.mood !== qMood) return false;
      const ts = qStart ? new Date(qStart).getTime() : -Infinity;
      const te = qEnd ? new Date(qEnd).getTime() + 24 * 3600 * 1000 - 1 : Infinity;
      const td = new Date(d.date).getTime();
      return td >= ts && td <= te;
    });
  }, [entries, qMood, qStart, qEnd]);

  // Kayıt oluşturma
  async function handleSubmit(payload: Omit<DreamEntry, "id">) {
    const saved = await createDream(payload);
    setEntries((prev) => {
      const next = [saved, ...prev];
      saveLocal(next); // localStorage güncelle
      return next;
    });
    setTab("list");
    showToast("Saved!");
  }

  return (
    <div className="container">
      <h1>
        Dream Journal <span className="badge">Spatial</span>
      </h1>

      <div className="tabs" role="tablist" aria-label="Views">
        <button
          role="tab"
          aria-selected={tab === "list"}
          className={"tab " + (tab === "list" ? "active" : "")}
          onClick={() => setTab("list")}
        >
          List
        </button>
        <button
          role="tab"
          aria-selected={tab === "map"}
          className={"tab " + (tab === "map" ? "active" : "")}
          onClick={() => setTab("map")}
        >
          Map
        </button>
      </div>

      <DreamForm
        onSubmit={handleSubmit}
        onPickOnMap={() => {
          setTab("map");
          setPickMode(true);
        }}
      />

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row">
          <div>
            <label>Mood</label>
            <select value={qMood} onChange={(e) => setQMood(e.target.value as any)}>
              <option value="all">All</option>
              <option value="happy">happy</option>
              <option value="neutral">neutral</option>
              <option value="sad">sad</option>
              <option value="scary">scary</option>
              <option value="mystic">mystic</option>
            </select>
          </div>
          <div>
            <label>Start</label>
            <input type="date" value={qStart} onChange={(e) => setQStart(e.target.value)} />
          </div>
          <div>
            <label>End</label>
            <input type="date" value={qEnd} onChange={(e) => setQEnd(e.target.value)} />
          </div>
        </div>
      </div>

      {tab === "list" ? (
        <div style={{ marginTop: 12 }} className="list">
          {filtered.map((d) => (
            <div className="card" key={d.id}>
              <div className="section-title">{d.title}</div>
              <div className="muted">
                {new Date(d.date).toLocaleString()} — {d.mood}
              </div>
              <p>{d.text}</p>
              {d.tags?.length ? <div className="muted">#{d.tags.join(" #")}</div> : null}
              {d.location ? (
                <div className="muted">
                  📍 {d.location.address ?? ""}{" "}
                  {`(${d.location.lat.toFixed(3)}, ${d.location.lng.toFixed(3)})`}
                </div>
              ) : null}
            </div>
          ))}
          {!filtered.length && <div className="muted">No entries yet. Add one above.</div>}
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          {/* Arama: tıklayınca haritayı uçur + form konumunu doldur */}
          <GeocoderSearch
            onSelect={(lat, lng, label) => {
              setMapCenter([lat, lng]);
              const ev = new CustomEvent("pick-location", {
                detail: { lat, lng, address: label },
              });
              window.dispatchEvent(ev);
            }}
          />

          {/* Use my location */}
          <div className="card" style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button className="primary" onClick={useMyLocation} disabled={locBusy}>
              {locBusy ? "Locating..." : "Use my location"}
            </button>
            {pickMode && <button onClick={() => setPickMode(false)}>Cancel pick</button>}
          </div>

          <MapTab
            entries={filtered}
            center={mapCenter}
            onAddByMap={async (lat, lng) => {
              let label = "";
              try {
                const r = await reverseGeocode(lat, lng);
                label = r.label;
              } catch {}
              if (pickMode) {
                const ev = new CustomEvent("pick-location", {
                  detail: { lat, lng, address: label },
                });
                window.dispatchEvent(ev);
                setPickMode(false);
              }
            }}
          />

          {pickMode && (
            <div className="muted" style={{ marginTop: 8 }}>
              Click on the map to select a location, then go back to the form.
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
