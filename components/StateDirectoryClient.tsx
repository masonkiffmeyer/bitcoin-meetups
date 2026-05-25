"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Meetup } from "@/lib/types";
import { getFreq, citySlug } from "@/data/meetups";

type Cadence = "weekly" | "monthly";

type Props = {
  stateSlugValue: string;
  meetups: Meetup[];
  cities: string[];
  cityCounts: Record<string, number>;
};

export default function StateDirectoryClient({
  stateSlugValue,
  meetups,
  cities,
  cityCounts,
}: Props) {
  const [activeCity, setActiveCity] = useState<"ALL" | string>("ALL");
  const [cadenceFilter, setCadenceFilter] = useState<Set<Cadence>>(
    new Set(["weekly", "monthly"])
  );

  const toggleCadence = (c: Cadence) => {
    setCadenceFilter((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return meetups.filter((m) => {
      if (activeCity !== "ALL" && m.city !== activeCity) return false;
      const f = getFreq(m);
      if (!cadenceFilter.has(f)) return false;
      return true;
    });
  }, [meetups, activeCity, cadenceFilter]);

  return (
    <div className="state-split">
      <aside className="state-sidebar">
        <h3>Cities</h3>
        <ul className="state-city-list">
          <li>
            <button
              type="button"
              className={`state-city-link ${activeCity === "ALL" ? "is-active" : ""}`}
              onClick={() => setActiveCity("ALL")}
            >
              <span>
                {activeCity === "ALL" && <span className="arrow">▸</span>}
                All cities
              </span>
              <span className="count">{meetups.length}</span>
            </button>
          </li>
          {cities.map((c) => (
            <li key={c}>
              <button
                type="button"
                className={`state-city-link ${activeCity === c ? "is-active" : ""}`}
                onClick={() => setActiveCity(c)}
              >
                <span>
                  {activeCity === c && <span className="arrow">▸</span>}
                  {c}
                </span>
                <span className="count">{cityCounts[c]}</span>
              </button>
            </li>
          ))}
        </ul>

        <h3>Filter cadence</h3>
        <div className="cadence-filter">
          <label>
            <input
              type="checkbox"
              checked={cadenceFilter.has("weekly")}
              onChange={() => toggleCadence("weekly")}
            />
            <span className="box" />
            Weekly
          </label>
          <label>
            <input
              type="checkbox"
              checked={cadenceFilter.has("monthly")}
              onChange={() => toggleCadence("monthly")}
            />
            <span className="box" />
            Monthly
          </label>
        </div>
      </aside>

      <div className="state-main">
        <div className="state-main-head">
          <h2>
            {filtered.length} {filtered.length === 1 ? "meetup" : "meetups"}{" "}
            {activeCity === "ALL" ? "across the state" : `in ${activeCity}`}
          </h2>
          <div className="state-main-sort">
            SORT · ALPHABETICAL ▾
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <h3>No meetups match your filters</h3>
            <p>Try toggling the cadence filter or selecting a different city.</p>
          </div>
        ) : (
          <div className="meetup-table">
            <div className="meetup-table-head">
              <span>Meetup</span>
              <span>City</span>
              <span>Cadence text</span>
              <span>Cadence</span>
              <span className="ta-r">Attend</span>
            </div>
            {filtered.map((m) => {
              const freq = getFreq(m);
              return (
                <Link
                  key={m.id}
                  href={`/${stateSlugValue}/${citySlug(m.city)}/${m.slug}`}
                  className="meetup-table-row"
                >
                  <div className="meetup-table-name">
                    <div className="meetup-table-name-row">
                      <span className="meetup-table-name-text">{m.name}</span>
                      {m.beginnerFriendly && (
                        <span className="pill pill-orange">Newcomer-friendly</span>
                      )}
                    </div>
                    <span className="meetup-table-venue">{m.venue}</span>
                  </div>
                  <div className="meetup-table-city">
                    {m.city}, {m.stateAbbr}
                  </div>
                  <div className="meetup-table-cadence">{m.cadence}</div>
                  <div>
                    <span className={`pill ${freq === "weekly" ? "pill-orange" : ""}`}>
                      ● {freq === "weekly" ? "WEEKLY" : "MONTHLY"}
                    </span>
                  </div>
                  <div className="meetup-table-attend">{m.attendance}</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
