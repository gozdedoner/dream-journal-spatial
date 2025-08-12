import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import type { DreamEntry } from "../types";
import type { LeafletMouseEvent } from "leaflet";
import ClusterLayer from "./ClusterLayer";

type Props = {
  entries: DreamEntry[];
  onAddByMap?: (lat: number, lng: number) => void;
  center?: [number, number];
};

function ClickToAdd({ onAdd }: { onAdd?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onAdd?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function SetView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 12);
  }, [center, map]);
  return null;
}

export default function MapTab({ entries, onAddByMap, center }: Props) {
  const defaultCenter = useMemo(() => [39.0, 35.0] as [number, number], []);

  return (
    <div className="mapwrap">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: "100%", width: "100%" }}   // <- ÖNEMLİ: inline boyut
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {center && <SetView center={center} />}

        <ClusterLayer entries={entries} />
        <ClickToAdd onAdd={onAddByMap} />
      </MapContainer>

      {/* Legend */}
      <div className="legend">
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Mood</div>
        <div className="legend-item"><span className="legend-swatch happy" /> happy</div>
        <div className="legend-item"><span className="legend-swatch neutral" /> neutral</div>
        <div className="legend-item"><span className="legend-swatch sad" /> sad</div>
        <div className="legend-item"><span className="legend-swatch scary" /> scary</div>
        <div className="legend-item"><span className="legend-swatch mystic" /> mystic</div>
      </div>
    </div>
  );
}
