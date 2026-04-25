"use client";

import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { Meetup } from "@/lib/types";
import Link from "next/link";

type Props = {
  meetups: Meetup[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

function FlyToSelected({ meetups, selectedId }: { meetups: Meetup[]; selectedId?: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const m = meetups.find((x) => x.id === selectedId);
    if (m) map.flyTo([m.lat, m.lng], Math.max(map.getZoom(), 7), { duration: 0.8 });
  }, [selectedId, meetups, map]);
  return null;
}

export default function MeetupMap({ meetups, selectedId, onSelect }: Props) {
  const center = useMemo<[number, number]>(() => [39.5, -98.35], []);

  return (
    <MapContainer
      center={center}
      zoom={4}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", borderRadius: "8px" }}
      minZoom={3}
      maxZoom={12}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {meetups.map((m) => {
        const isSelected = m.id === selectedId;
        return (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={isSelected ? 9 : 6}
            pathOptions={{
              color: isSelected ? "#F7931A" : "#FFFFFF",
              weight: isSelected ? 3 : 1.5,
              fillColor: isSelected ? "#FFFFFF" : "#F7931A",
              fillOpacity: 1,
            }}
            eventHandlers={{
              click: () => onSelect?.(m.id),
            }}
          >
            <Popup>
              <div style={{ minWidth: "180px" }}>
                <div style={{ color: "#F7931A", fontSize: 11, marginBottom: 2 }}>
                  {m.city}, {m.stateAbbr}
                </div>
                <div style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                  {m.name}
                </div>
                <div style={{ color: "#B5B8C2", fontSize: 12, marginBottom: 8 }}>
                  {m.cadence}
                </div>
                <Link
                  href={`/meetups/${m.slug}`}
                  style={{
                    color: "#F7931A",
                    fontSize: 12,
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
      <FlyToSelected meetups={meetups} selectedId={selectedId} />
    </MapContainer>
  );
}
