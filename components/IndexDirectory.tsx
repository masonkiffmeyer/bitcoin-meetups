"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Meetup } from "@/lib/types";
import { STATE_NAMES, STATE_NEIGHBORS } from "@/lib/state-neighbors";
import MiniUSMap from "@/components/MiniUSMap";

type Props = {
  meetups: Meetup[];
  allMeetups: Meetup[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onOpen?: (id: string) => void;
};

function DirRow({
  meetup,
  selected,
  onSelect,
  onOpen,
}: {
  meetup: Meetup;
  selected: boolean;
  onSelect?: (id: string) => void;
  onOpen?: (id: string) => void;
}) {
  const link = meetup.website
    ? meetup.website.replace(/^https?:\/\//, "")
    : meetup.twitter
    ? `@${meetup.twitter}`
    : "";
  return (
    <button
      type="button"
      className={`drow ${selected ? "is-selected" : ""}`}
      onMouseEnter={() => onSelect?.(meetup.id)}
      onClick={() => onOpen?.(meetup.id)}
    >
      <span className="drow-marker" />
      <span className="drow-name">{meetup.name}</span>
      <span className="drow-city">{meetup.city}</span>
      <span className="drow-cadence">{meetup.cadence}</span>
      <span className="drow-link">{link ? `${link} ↗` : ""}</span>
    </button>
  );
}

export default function IndexDirectory({
  meetups,
  allMeetups,
  selectedId,
  onSelect,
  onOpen,
}: Props) {
  const groups = useMemo(() => {
    const g: Record<string, { stateName: string; list: Meetup[] }> = {};
    for (const m of meetups) {
      if (!g[m.stateAbbr]) g[m.stateAbbr] = { stateName: m.state, list: [] };
      g[m.stateAbbr].list.push(m);
    }
    return g;
  }, [meetups]);

  const ordered = useMemo(
    () =>
      Object.keys(groups).sort((a, b) =>
        groups[a].stateName.localeCompare(groups[b].stateName)
      ),
    [groups]
  );

  const [activeState, setActiveState] = useState<string | undefined>(ordered[0]);

  useEffect(() => {
    if ((!activeState || !ordered.includes(activeState)) && ordered.length) {
      setActiveState(ordered[0]);
    }
  }, [ordered, activeState]);

  // Nearby is computed against the unfiltered set so user filters (state
  // dropdown, freq chips) don't zero it out. The "Bordering" label is
  // self-explanatory enough that this isn't a surprise.
  const neighborCodes = activeState ? STATE_NEIGHBORS[activeState] ?? [] : [];

  const nearby = useMemo(() => {
    const byState: Record<string, Meetup[]> = {};
    for (const code of neighborCodes) {
      const list = allMeetups.filter((m) => m.stateAbbr === code);
      if (list.length) byState[code] = list;
    }
    const sorted = Object.keys(byState).sort((a, b) =>
      (STATE_NAMES[a] ?? a).localeCompare(STATE_NAMES[b] ?? b)
    );
    return { byState, sorted };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMeetups, activeState]);

  if (!ordered.length || !activeState) return null;

  const active = groups[activeState] ?? groups[ordered[0]];
  const stateFullName = STATE_NAMES[activeState] ?? active.stateName;
  const showNearby = active.list.length < 4 && nearby.sorted.length > 0;
  const firstCoords = active.list[0];

  return (
    <div className="dir-index">
      <aside className="dir-index-aside">
        <div className="dir-index-aside-head">By state</div>
        <ul className="dir-index-list">
          {ordered.map((code) => (
            <li key={code}>
              <button
                type="button"
                className={`dir-index-state ${activeState === code ? "is-active" : ""}`}
                onClick={() => setActiveState(code)}
              >
                <span>{groups[code].stateName}</span>
                <span className="dir-index-state-count">{groups[code].list.length}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="dir-index-main">
        <div className="dir-index-head">
          <div>
            <h3 className="dir-index-title">{stateFullName}</h3>
            <span className="dir-index-sub">
              {active.list.length} meetup{active.list.length === 1 ? "" : "s"}
            </span>
          </div>
          <span className="dir-index-code">{activeState}</span>
        </div>
        <div className="dir-index-rows">
          {active.list.map((m) => (
            <DirRow
              key={m.id}
              meetup={m}
              selected={selectedId === m.id}
              onSelect={onSelect}
              onOpen={onOpen}
            />
          ))}
        </div>

        {showNearby && (
          <div className="dir-nearby">
            <div className="dir-nearby-head">
              <span className="dir-nearby-eyebrow">Nearby</span>
              <span className="dir-nearby-sub">Bordering {stateFullName}</span>
            </div>
            {nearby.sorted.map((code) => (
              <div key={code} className="dir-nearby-state">
                <div className="dir-nearby-state-label">
                  <span className="dir-nearby-state-name">
                    {STATE_NAMES[code] ?? code}
                  </span>
                  <span className="dir-nearby-state-count">
                    {nearby.byState[code].length}
                  </span>
                </div>
                {nearby.byState[code].map((m) => (
                  <DirRow
                    key={m.id}
                    meetup={m}
                    selected={selectedId === m.id}
                    onSelect={onSelect}
                    onOpen={onOpen}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="dir-index-footer">
          <div className="dir-index-mini-wrap">
            <div className="dir-index-mini-head">
              <span className="dir-index-mini-label">Region</span>
              <span className="dir-index-mini-coord">
                {firstCoords
                  ? `${firstCoords.lat.toFixed(1)}°N · ${Math.abs(firstCoords.lng).toFixed(1)}°W`
                  : ""}
              </span>
            </div>
            <MiniUSMap activeStateCode={activeState} neighborCodes={neighborCodes} />
            <div className="dir-index-mini-legend">
              <span>
                <span className="mini-swatch" />
                Selected
              </span>
              {showNearby && (
                <span>
                  <span className="mini-swatch nearby" />
                  Bordering
                </span>
              )}
            </div>
          </div>
          <div className="dir-index-cta">
            <div className="dir-index-cta-eyebrow">Don&apos;t see your meetup?</div>
            <div className="dir-index-cta-title">Add a group in {stateFullName}</div>
            <p className="dir-index-cta-sub">
              Free, always. We verify and publish within 48 hours.
            </p>
            <Link href="/submit" className="btn btn-primary">
              Submit a meetup →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
