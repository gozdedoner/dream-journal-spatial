import { useEffect, useMemo, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Supercluster, { AnyProps, PointFeature } from "supercluster";
import type { DreamEntry, Mood } from "../types";

function iconForMood(mood: Mood) {
  return L.divIcon({
    className: `dj-marker dj-${mood}`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}
function clusterIcon(count: number) {
  return L.divIcon({
    html: `<div class="dj-cluster">${count}</div>`,
    className: "dj-cluster",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

type PtProps = {
  dreamId: string;
  title: string;
  mood: Mood;
  date: string;
  address: string;
};

type Props = { entries: DreamEntry[] };

export default function ClusterLayer({ entries }: Props) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const [bounds, setBounds] = useState<[number, number, number, number]>();

  // Prepare GeoJSON points
  const points: PointFeature<PtProps>[] = useMemo(() => {
    return entries
      .filter((d) => d.location)
      .map((d) => ({
        type: "Feature",
        properties: {
          cluster: false,
          dreamId: d.id,
          title: d.title,
          mood: d.mood,
          date: d.date,
          address: d.location?.address ?? "",
        },
        geometry: {
          type: "Point",
          coordinates: [d.location!.lng, d.location!.lat], // [lng, lat]
        },
      }));
  }, [entries]);

  // Build index
  const index = useMemo(() => {
    return new Supercluster<PtProps, AnyProps>({
      radius: 60,
      maxZoom: 18,
    }).load(points);
  }, [points]);

  // Track map viewport
  useEffect(() => {
    const update = () => {
      const b = map.getBounds();
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      setZoom(map.getZoom());
    };
    update();
    map.on("moveend", update);
    return () => map.off("moveend", update);
  }, [map]);

  if (!bounds) return null;

  const clusters = index.getClusters(bounds, Math.round(zoom));

  return (
    <>
      {clusters.map((c: any) => {
        const [lng, lat] = c.geometry.coordinates;
        const { cluster: isCluster, point_count: count } = c.properties;

        if (isCluster) {
          const id = c.properties.cluster_id; // <-- doğru alan
          return (
            <Marker
              key={`cluster-${id}`}
              position={[lat, lng]}
              icon={clusterIcon(count)}
              eventHandlers={{
                click: () => {
                  const nextZoom = Math.min(index.getClusterExpansionZoom(id), 18);
                  map.setView([lat, lng], nextZoom);
                },
              }}
            />
          );
        }

        // Single point
        return (
          <Marker
            key={c.properties.dreamId}
            position={[lat, lng]}
            icon={iconForMood(c.properties.mood)}
          >
            <Popup>
              <b>{c.properties.title}</b>
              <br />
              {new Date(c.properties.date).toLocaleDateString()} — {c.properties.mood}
              <br />
              {c.properties.address}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
