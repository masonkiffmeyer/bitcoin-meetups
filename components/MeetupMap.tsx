"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { loadStatesGeo } from "@/lib/us-atlas";
import type { Meetup } from "@/lib/types";
import { getFreq, stateSlug, citySlug } from "@/lib/meetups";

type StatePath = { id: string; name: string; d: string };
type Projection = (point: [number, number]) => [number, number] | null;
type ProjectedMeetup = Meetup & { mx: number; my: number };

type Props = {
  meetups: Meetup[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export default function MeetupMap({ meetups, selectedId, onSelect }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ W: 1200, H: 720 });
  const [statePaths, setStatePaths] = useState<{ paths: StatePath[]; projection: Projection } | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [popupId, setPopupId] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [geoFailed, setGeoFailed] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      // The viewBox has to track the real box: the old 600x400 floor meant a
      // 390px-wide phone rendered a 600-unit-wide viewBox into a 390px frame,
      // and with preserveAspectRatio="none" that squashed the country
      // horizontally. Small floors here only guard against a zero-size box
      // during layout.
      const cw = Math.max(240, Math.round(e.contentRect.width));
      const ch = Math.max(200, Math.round(e.contentRect.height));
      setSize((s) =>
        // Mobile browsers resize the viewport continuously as the URL bar
        // hides on scroll. Re-projecting the whole country for a few pixels
        // burns the main thread, so ignore sub-16px jitter.
        Math.abs(s.W - cw) < 16 && Math.abs(s.H - ch) < 16 ? s : { W: cw, H: ch }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Coarse pointers get bigger pins and a bottom-sheet popup instead of a
  // 320px bubble that would hang off the edge of a phone screen.
  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (max-width: 700px)");
    const sync = () => setIsTouch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { W, H } = size;
  const compact = W < 640;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Shared, promise-cached loader: this effect re-runs on every resize
      // step (and mobile browsers fire resizes as the URL bar collapses), so
      // fetching here directly meant re-downloading ~1MB mid-scroll.
      const states = await loadStatesGeo().catch(() => null);
      if (cancelled) return;
      if (!states) {
        setGeoFailed(true);
        return;
      }
      setGeoFailed(false);

      const PAD_X = W < 640 ? 10 : 32;
      const PAD_Y = W < 640 ? 10 : 28;
      const projection = geoAlbersUsa().fitExtent(
        [[PAD_X, PAD_Y], [W - PAD_X, H - PAD_Y]],
        states
      );
      const path = geoPath(projection);

      const paths: StatePath[] = states.features.map((f: any) => ({
        id: String(f.id),
        name: f.properties.name as string,
        d: path(f) || "",
      }));
      setStatePaths({ paths, projection: projection as unknown as Projection });
    })();
    return () => {
      cancelled = true;
    };
  }, [W, H]);

  const projectedMeetups: ProjectedMeetup[] = statePaths
    ? meetups
        .map((m) => {
          const p = statePaths.projection([m.lng, m.lat]);
          return p ? { ...m, mx: p[0], my: p[1] } : null;
        })
        .filter((m): m is ProjectedMeetup => m !== null)
    : [];

  const popupMeetup = popupId ? projectedMeetups.find((m) => m.id === popupId) : null;

  const handlePinClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(id);
    setPopupId(id);
  };
  const closePopup = () => setPopupId(null);

  const stroke = "#E0D6C2";
  const landFill = "#F0E9DB";
  const oceanFill = "#FFFFFF";
  const gridStroke = "rgba(26, 23, 20, 0.05)";

  return (
    <div className="map-frame" ref={wrapRef} onClick={closePopup}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="map-svg"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Map of ${meetups.length} bitcoin meetups across the United States`}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={gridStroke} strokeWidth="1" />
          </pattern>
          <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F7931A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F7931A" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill={oceanFill} />
        <rect width={W} height={H} fill="url(#grid)" />

        {statePaths && (
          <g>
            {statePaths.paths.map((s) => (
              <path
                key={s.id}
                d={s.d}
                fill={landFill}
                stroke={stroke}
                strokeWidth="0.6"
                strokeLinejoin="round"
              />
            ))}
          </g>
        )}

        {/* Survey-frame ticks and captions are decoration; on a phone they eat
            the margins the map itself needs. */}
        {!compact && (
          <>
            <g stroke="rgba(133, 123, 110, 0.45)" strokeWidth="1" fill="none">
              <path d="M 12 12 L 32 12 M 12 12 L 12 32" />
              <path d={`M ${W - 12} 12 L ${W - 32} 12 M ${W - 12} 12 L ${W - 12} 32`} />
              <path d={`M 12 ${H - 12} L 32 ${H - 12} M 12 ${H - 12} L 12 ${H - 32}`} />
              <path
                d={`M ${W - 12} ${H - 12} L ${W - 32} ${H - 12} M ${W - 12} ${H - 12} L ${W - 12} ${H - 32}`}
              />
            </g>

            <g fontFamily="var(--font-mono), monospace" fontSize="11" fill="rgba(133, 123, 110, 0.85)">
              <text x="40" y="24">ALBERS USA · NAD83</text>
              <text x={W - 40} y="24" textAnchor="end">N {meetups.length} MEETUPS</text>
              <text x="40" y={H - 12}>MEETUPS · 2026</text>
              <text x={W - 40} y={H - 12} textAnchor="end">LIVE · v2026.04</text>
            </g>
          </>
        )}

        {projectedMeetups.map((m) => {
          const sel = m.id === selectedId || m.id === hoverId;
          const r = sel ? (isTouch ? 9 : 8) : isTouch ? 6 : 4.5;
          return (
            <g
              key={m.id}
              transform={`translate(${m.mx}, ${m.my})`}
              className={`pin ${sel ? "pin-sel" : ""}`}
              onMouseEnter={() => setHoverId(m.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={(e) => handlePinClick(m.id, e)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={`${m.name} — ${m.city}, ${m.stateAbbr}`}
            >
              {sel && <circle r="22" fill="url(#pinGlow)" />}
              {/* Invisible disc so a fingertip has something to hit; the
                  visible dot is far below the 44px guideline. */}
              <circle r={isTouch ? 18 : 12} fill="transparent" />
              <circle
                r={r}
                fill="#F7931A"
                stroke="#FFFFFF"
                strokeWidth={sel ? 2.5 : 1.5}
              />
              {sel && (
                <circle r="13" fill="none" stroke="#F7931A" strokeWidth="1" opacity="0.55" />
              )}
            </g>
          );
        })}
      </svg>

      {popupMeetup && (
        <div
          className={`map-popup ${isTouch ? "map-popup-sheet" : ""}`}
          style={
            isTouch
              ? undefined
              : {
                  left: `${(popupMeetup.mx / W) * 100}%`,
                  top: `${(popupMeetup.my / H) * 100}%`,
                }
          }
          onClick={(e) => e.stopPropagation()}
        >
          <button className="map-popup-close" onClick={closePopup} aria-label="Close popup">
            ×
          </button>
          <div className="map-popup-eyebrow">
            <span className={`freq-dot freq-${getFreq(popupMeetup)}`}>
              <span className="freq-dot-inner" />
              {getFreq(popupMeetup) === "weekly" ? "Weekly" : "Monthly"}
            </span>
          </div>
          <h3 className="map-popup-name">{popupMeetup.name}</h3>
          <div className="map-popup-loc">
            {popupMeetup.city}, {popupMeetup.stateAbbr}
          </div>
          <div className="map-popup-cadence">{popupMeetup.cadence}</div>
          <div className="map-popup-coords">
            {popupMeetup.lat.toFixed(3)}°N · {Math.abs(popupMeetup.lng).toFixed(3)}°W
          </div>
          <div className="map-popup-actions">
            <Link
              href={`/${stateSlug(popupMeetup.state)}/${citySlug(popupMeetup.city)}/${popupMeetup.slug}`}
              className="btn btn-primary"
              onClick={(e) => e.stopPropagation()}
            >
              View details
            </Link>
          </div>
        </div>
      )}

      {!statePaths && (
        <div className="map-loading">
          {geoFailed ? (
            /* The map outline comes from a CDN. On a dropped mobile connection
               that request fails, and an endless "loading" spinner reads as a
               broken site — say what happened and point at the directory,
               which is fully rendered further down the page. */
            <span className="mono map-loading-error">
              MAP UNAVAILABLE — BROWSE THE DIRECTORY BELOW
            </span>
          ) : (
            <span className="mono">LOADING US GEOMETRY…</span>
          )}
        </div>
      )}
    </div>
  );
}
