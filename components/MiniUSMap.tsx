"use client";

import { useEffect, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const W = 360;
const H = 220;

// FIPS codes used by us-atlas; the rest of the app uses 2-letter postal codes.
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

type StatePath = { id: string; d: string };

// Module-scoped cache so the topojson is fetched once and reused as the user
// clicks between states. The main map already pulled this URL, so the second
// component usually hits the HTTP cache anyway.
let _cachedStates: { features: { id: string | number; properties: { name: string } }[] } | null = null;

async function loadStates() {
  if (_cachedStates) return _cachedStates;
  const us = await fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then((r) =>
    r.json()
  );
  _cachedStates = feature(us as any, (us as any).objects.states) as any;
  return _cachedStates;
}

type Props = {
  activeStateCode?: string;
  neighborCodes?: string[];
};

export default function MiniUSMap({ activeStateCode, neighborCodes = [] }: Props) {
  const [paths, setPaths] = useState<StatePath[] | null>(null);

  const activeFips = activeStateCode ? STATE_CODE_TO_FIPS[activeStateCode] : undefined;
  const neighborFips = new Set(
    neighborCodes.map((c) => STATE_CODE_TO_FIPS[c]).filter(Boolean)
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const states = await loadStates();
      if (!states || cancelled) return;
      const projection = geoAlbersUsa().fitExtent(
        [[6, 6], [W - 6, H - 6]],
        states as any
      );
      const path = geoPath(projection);
      const built: StatePath[] = (states.features as any[]).map((f) => ({
        id: String(f.id),
        d: path(f as any) || "",
      }));
      setPaths(built);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mini-map"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern
          id="mini-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="rgba(247,147,26,0.25)"
            strokeWidth="2"
          />
        </pattern>
      </defs>
      {paths &&
        paths.map((p) => {
          const isActive = p.id === activeFips;
          const isNeighbor = neighborFips.has(p.id);
          return (
            <path
              key={p.id}
              d={p.d}
              fill={
                isActive
                  ? "var(--orange)"
                  : isNeighbor
                  ? "url(#mini-hatch)"
                  : "var(--bg-elev-2)"
              }
              stroke={isActive ? "var(--orange)" : "var(--line-strong)"}
              strokeWidth="0.6"
            />
          );
        })}
    </svg>
  );
}
