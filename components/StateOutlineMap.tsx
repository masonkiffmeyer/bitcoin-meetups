"use client";

import { useEffect, useState } from "react";
import { geoMercator, geoPath, geoBounds } from "d3-geo";
import { feature } from "topojson-client";
import type { Meetup } from "@/lib/types";

const W = 400;
const H = 340;
const PAD = 36;

// FIPS codes used by us-atlas
const STATE_CODE_TO_FIPS: Record<string, string> = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09",
  DE: "10", DC: "11", FL: "12", GA: "13", HI: "15", ID: "16", IL: "17",
  IN: "18", IA: "19", KS: "20", KY: "21", LA: "22", ME: "23", MD: "24",
  MA: "25", MI: "26", MN: "27", MS: "28", MO: "29", MT: "30", NE: "31",
  NV: "32", NH: "33", NJ: "34", NM: "35", NY: "36", NC: "37", ND: "38",
  OH: "39", OK: "40", OR: "41", PA: "42", RI: "44", SC: "45", SD: "46",
  TN: "47", TX: "48", UT: "49", VT: "50", VA: "51", WA: "53", WV: "54",
  WI: "55", WY: "56",
};

let _cached: any | null = null;
async function loadStates() {
  if (_cached) return _cached;
  const us = await fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then((r) =>
    r.json()
  );
  _cached = feature(us as any, (us as any).objects.states) as any;
  return _cached;
}

type Props = {
  stateAbbr: string;
  meetups: Meetup[];
};

type PinPoint = { x: number; y: number; city: string; count: number };

export default function StateOutlineMap({ stateAbbr, meetups }: Props) {
  const [path, setPath] = useState<string | null>(null);
  const [pins, setPins] = useState<PinPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const states = await loadStates();
      if (!states || cancelled) return;
      const fips = STATE_CODE_TO_FIPS[stateAbbr];
      const stateFeature = states.features.find(
        (f: any) => String(f.id) === fips
      );
      if (!stateFeature) return;

      const projection = geoMercator().fitExtent(
        [[PAD, PAD], [W - PAD, H - PAD]],
        stateFeature
      );
      const pathBuilder = geoPath(projection);
      setPath(pathBuilder(stateFeature) || "");

      // Aggregate meetups by city for the pin layer
      const byCity = new Map<string, { lat: number; lng: number; count: number }>();
      for (const m of meetups) {
        const existing = byCity.get(m.city);
        if (existing) existing.count++;
        else byCity.set(m.city, { lat: m.lat, lng: m.lng, count: 1 });
      }

      const projected: PinPoint[] = [];
      for (const [city, info] of byCity) {
        const p = projection([info.lng, info.lat]);
        if (p) projected.push({ x: p[0], y: p[1], city, count: info.count });
      }
      // Sort largest first so smaller pins draw on top of the cluster bg
      projected.sort((a, b) => b.count - a.count);
      setPins(projected);
    })();
    return () => {
      cancelled = true;
    };
  }, [stateAbbr, meetups]);

  const cityCount = new Set(meetups.map((m) => m.city)).size;

  return (
    <div className="geo-panel">
      <div className="hairgrid-fine" />
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="state-hatch" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M0,6 L6,0" stroke="rgba(247,147,26,0.10)" strokeWidth="1" />
          </pattern>
        </defs>
        {path && (
          <>
            <path
              d={path}
              fill="var(--orange-soft)"
              stroke="var(--orange)"
              strokeWidth="1.5"
            />
            <path d={path} fill="url(#state-hatch)" />
            {pins.map((p) => (
              <g key={p.city}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={Math.min(8, 3.5 + p.count * 0.8)}
                  fill="var(--orange)"
                  stroke="#FFFFFF"
                  strokeWidth="1.25"
                  style={{ filter: "drop-shadow(0 0 6px rgba(247,147,26,0.4))" }}
                />
                <text
                  x={p.x + 10}
                  y={p.y + 4}
                  fontSize="10"
                  fill="var(--ink)"
                  fontFamily="Geist"
                  fontWeight="500"
                >
                  {p.city}
                </text>
              </g>
            ))}
          </>
        )}
      </svg>
      <div className="geo-panel-label">
        {stateAbbr} · {cityCount} {cityCount === 1 ? "CITY" : "CITIES"}
      </div>
    </div>
  );
}
