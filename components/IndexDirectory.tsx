"use client";

import { useEffect, useMemo, useState } from "react";
import type { Meetup } from "@/lib/types";

type Props = {
  meetups: Meetup[];
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

export default function IndexDirectory({ meetups, selectedId, onSelect, onOpen }: Props) {
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
      Object.keys(groups).sort((a, b) => groups[a].stateName.localeCompare(groups[b].stateName)),
    [groups]
  );

  const [activeState, setActiveState] = useState<string | undefined>(ordered[0]);

  useEffect(() => {
    if ((!activeState || !ordered.includes(activeState)) && ordered.length) {
      setActiveState(ordered[0]);
    }
  }, [ordered, activeState]);

  if (!ordered.length) return null;

  const active =
    activeState && groups[activeState] ? groups[activeState] : groups[ordered[0]];

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
          <h3 className="dir-index-title">{active.stateName}</h3>
          <span className="dir-index-sub">
            {active.list.length} meetup{active.list.length === 1 ? "" : "s"}
          </span>
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
      </div>
    </div>
  );
}
